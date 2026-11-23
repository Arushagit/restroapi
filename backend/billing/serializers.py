from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone
from .models import Payment
from orders.models import Order
from orders.serializers import OrderSerializer


class PaymentSerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_details', 'payment_method', 'payment_status',
            'subtotal', 'tax_rate', 'tax_amount', 'discount_amount', 'total_amount',
            'amount_paid', 'change_amount', 'invoice_number', 'notes',
            'created_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = [
            'id', 'subtotal', 'tax_rate', 'tax_amount', 'total_amount',
            'change_amount', 'invoice_number', 'created_at', 'created_by'
        ]

    def create(self, validated_data):
        order = validated_data['order']
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        # Check if already paid
        if hasattr(order, 'payment'):
            raise serializers.ValidationError({"order": f"Payment already exists for Order #{order.id}."})

        discount_amount = validated_data.get('discount_amount', Decimal('0.00'))
        amount_paid = validated_data.get('amount_paid', Decimal('0.00'))
        tax_rate = Decimal('5.00')

        subtotal = order.subtotal
        tax_amount = order.tax_amount
        total_amount = max(Decimal('0.00'), subtotal + tax_amount - discount_amount)
        change_amount = max(Decimal('0.00'), amount_paid - total_amount)

        # Generate unique invoice number: RF-YYYYMM-XXXX
        now = timezone.now()
        count = Payment.objects.filter(created_at__year=now.year).count() + 1
        invoice_number = f"RF-{now.year}{now.month:02d}-{order.id:04d}-{count:02d}"

        payment = Payment.objects.create(
            order=order,
            payment_method=validated_data.get('payment_method', 'cash'),
            payment_status='completed',
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            amount_paid=amount_paid,
            change_amount=change_amount,
            invoice_number=invoice_number,
            notes=validated_data.get('notes', ''),
            created_by=user
        )

        # Update order status to completed
        order.status = 'completed'
        order.discount_amount = discount_amount
        order.total_amount = total_amount
        order.save()

        # Free table if dine-in
        if order.table:
            order.table.status = 'available'
            order.table.save()

        return payment
