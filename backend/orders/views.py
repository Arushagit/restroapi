from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderStatusHistory
from .serializers import OrderSerializer, OrderStatusHistorySerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'order_type', 'table']
    search_fields = ['id', 'customer__username', 'customer__first_name', 'delivery_address']
    ordering_fields = ['created_at', 'total_amount']
    ordering = ['-created_at']
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        if user.role in ['admin', 'staff', 'kitchen']:
            return Order.objects.select_related('customer', 'table').prefetch_related('items__food_item', 'status_history').all()
        return Order.objects.filter(customer=user).select_related('customer', 'table').prefetch_related('items__food_item', 'status_history')

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], url_path='update_status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        note = request.data.get('note', '')

        valid_statuses = dict(Order.STATUS_CHOICES)
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status '{new_status}'. Valid choices are: {list(valid_statuses.keys())}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()

        # Free table if order is completed or cancelled
        if new_status in ['completed', 'cancelled'] and order.table:
            active_orders = Order.objects.filter(
                table=order.table,
                status__in=['pending', 'confirmed', 'preparing', 'ready']
            ).exclude(id=order.id)
            if not active_orders.exists():
                order.table.status = 'available'
                order.table.save()

        # Create history record
        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            changed_by=request.user,
            note=note or f"Status changed to {new_status}"
        )

        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my_orders')
    def my_orders(self, request):
        if not request.user.is_authenticated:
            return Response([], status=status.HTTP_200_OK)
        orders = Order.objects.filter(customer=request.user).order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='kitchen')
    def kitchen_orders(self, request):
        orders = Order.objects.filter(
            status__in=['pending', 'confirmed', 'preparing', 'ready', 'completed']
        ).order_by('created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
