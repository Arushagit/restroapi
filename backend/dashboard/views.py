from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from django.db.models import Sum, Count, F
from datetime import timedelta
from decimal import Decimal
from orders.models import Order, OrderItem
from billing.models import Payment
from authentication.models import User
from menu.models import FoodItem
from core.permissions import IsAdminUser


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # 1. Total orders
        total_orders = Order.objects.count()

        # 2. Today's orders
        today_orders = Order.objects.filter(created_at__gte=today_start).count()

        # 3. Today's revenue (from completed orders or payments)
        today_revenue = Payment.objects.filter(
            created_at__gte=today_start, payment_status='completed'
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # Total overall revenue
        total_revenue = Payment.objects.filter(
            payment_status='completed'
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # 4. Status counts
        pending_orders = Order.objects.filter(status='pending').count()
        preparing_orders = Order.objects.filter(status='preparing').count()
        ready_orders = Order.objects.filter(status='ready').count()
        completed_orders = Order.objects.filter(status='completed').count()
        cancelled_orders = Order.objects.filter(status='cancelled').count()

        # 5. Total customers
        total_customers = User.objects.filter(role='customer').count()

        # 6. Popular food items
        popular_items_qs = OrderItem.objects.values(
            'food_item__id', 'food_item__name', 'food_item__price', 'food_item__food_type'
        ).annotate(
            order_count=Sum('quantity'),
            total_revenue=Sum('subtotal')
        ).order_by('-order_count')[:5]

        popular_items = [
            {
                'id': item['food_item__id'],
                'name': item['food_item__name'],
                'price': str(item['food_item__price']),
                'type': item['food_item__food_type'],
                'order_count': item['order_count'],
                'revenue': float(item['total_revenue'] or 0)
            }
            for item in popular_items_qs
        ]

        # 7. Revenue chart - last 7 days
        revenue_chart = []
        for i in range(6, -1, -1):
            day_date = (now - timedelta(days=i)).date()
            day_start = timezone.make_aware(
                timezone.datetime.combine(day_date, timezone.datetime.min.time())
            )
            day_end = timezone.make_aware(
                timezone.datetime.combine(day_date, timezone.datetime.max.time())
            )

            day_rev = Payment.objects.filter(
                created_at__range=(day_start, day_end),
                payment_status='completed'
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

            day_orders_count = Order.objects.filter(
                created_at__range=(day_start, day_end)
            ).count()

            revenue_chart.append({
                'date': day_date.strftime('%b %d'),
                'revenue': float(day_rev),
                'orders': day_orders_count
            })

        # 8. Recent orders
        recent_orders_qs = Order.objects.select_related('customer', 'table').order_by('-created_at')[:8]
        recent_orders = [
            {
                'id': ord.id,
                'customer_name': ord.customer.get_full_name() or ord.customer.username if ord.customer else 'Guest',
                'order_type': ord.order_type,
                'table_number': ord.table.table_number if ord.table else None,
                'total_amount': str(ord.total_amount),
                'status': ord.status,
                'items_count': ord.items.count(),
                'created_at': ord.created_at.strftime('%H:%M - %b %d')
            }
            for ord in recent_orders_qs
        ]

        return Response({
            'total_orders': total_orders,
            'today_orders': today_orders,
            'today_revenue': float(today_revenue),
            'total_revenue': float(total_revenue),
            'pending_orders': pending_orders,
            'preparing_orders': preparing_orders,
            'ready_orders': ready_orders,
            'completed_orders': completed_orders,
            'cancelled_orders': cancelled_orders,
            'total_customers': total_customers,
            'popular_items': popular_items,
            'revenue_chart': revenue_chart,
            'recent_orders': recent_orders,
        })
