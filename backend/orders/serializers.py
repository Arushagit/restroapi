from rest_framework import serializers
from decimal import Decimal
from django.db import transaction
from .models import Order, OrderItem, OrderStatusHistory
from menu.models import FoodItem
from tables.models import RestaurantTable


class OrderItemSerializer(serializers.ModelSerializer):
    food_item_name = serializers.CharField(source='food_item.name', read_only=True)
    food_item_price = serializers.DecimalField(source='food_item.price', max_digits=10, decimal_places=2, read_only=True)
    food_item_type = serializers.CharField(source='food_item.food_type', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'food_item', 'food_item_name', 'food_item_price', 'food_item_type',
            'quantity', 'unit_price', 'subtotal', 'notes'
        ]


class OrderItemCreateSerializer(serializers.Serializer):
    food_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    notes = serializers.CharField(max_length=200, required=False, allow_blank=True, default='')


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'changed_by', 'changed_by_name', 'note', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    items_input = OrderItemCreateSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'table', 'table_number',
            'order_type', 'status', 'special_instructions', 'delivery_address',
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
            'items', 'items_input', 'status_history', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'customer', 'status', 'subtotal', 'tax_amount', 'discount_amount',
            'total_amount', 'created_at', 'updated_at'
        ]

    def get_customer_name(self, obj):
        if obj.customer:
            return obj.customer.get_full_name() or obj.customer.username
        return "Walk-in Guest"

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items_input', [])
        if not items_data:
            raise serializers.ValidationError({"items": "Order must have at least one item."})

        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        # Calculate totals securely using DB prices
        subtotal = Decimal('0.00')
        item_objects = []

        for item_info in items_data:
            food_id = item_info['food_item_id']
            qty = item_info.get('quantity', 1)
            notes = item_info.get('notes', '')

            try:
                food = FoodItem.objects.get(id=food_id, is_available=True)
            except FoodItem.DoesNotExist:
                raise serializers.ValidationError({"food_item": f"Item ID {food_id} not found or unavailable."})

            item_subtotal = food.price * qty
            subtotal += item_subtotal
            item_objects.append({
                'food_item': food,
                'quantity': qty,
                'unit_price': food.price,
                'subtotal': item_subtotal,
                'notes': notes
            })

        tax_rate = Decimal('0.05') # 5% GST
        tax_amount = (subtotal * tax_rate).quantize(Decimal('0.01'))
        discount_amount = Decimal('0.00')
        total_amount = subtotal + tax_amount - discount_amount

        order = Order.objects.create(
            customer=user,
            created_by=user,
            subtotal=subtotal,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            status='pending',
            **validated_data
        )

        for item in item_objects:
            OrderItem.objects.create(
                order=order,
                food_item=item['food_item'],
                quantity=item['quantity'],
                unit_price=item['unit_price'],
                subtotal=item['subtotal'],
                notes=item['notes']
            )

        # Update table status if dine-in
        if order.table and order.order_type == 'dine_in':
            order.table.status = 'occupied'
            order.table.save()

        # Log status history
        OrderStatusHistory.objects.create(
            order=order,
            status='pending',
            changed_by=user,
            note='Order placed'
        )

        return order
