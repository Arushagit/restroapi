from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from orders.models import Order
from orders.serializers import OrderSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('order', 'created_by').all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'staff']:
            return Payment.objects.select_related('order', 'created_by').all().order_by('-created_at')
        return Payment.objects.filter(order__customer=user).select_related('order', 'created_by').order_by('-created_at')

    @action(detail=True, methods=['get'], url_path='invoice')
    def invoice(self, request, pk=None):
        payment = self.get_object()
        order = payment.order
        return Response({
            'invoice_number': payment.invoice_number,
            'date': payment.created_at,
            'payment_method': payment.payment_method,
            'payment_status': payment.payment_status,
            'subtotal': str(payment.subtotal),
            'tax_rate': str(payment.tax_rate),
            'tax_amount': str(payment.tax_amount),
            'discount_amount': str(payment.discount_amount),
            'total_amount': str(payment.total_amount),
            'amount_paid': str(payment.amount_paid),
            'change_amount': str(payment.change_amount),
            'notes': payment.notes,
            'order': OrderSerializer(order).data,
            'restaurant': {
                'name': 'RESTROFLOW',
                'tagline': 'Premium Modern Dining & Bistro',
                'address': '123 Gourmet Boulevard, Foodville',
                'phone': '+91 98765 43210',
                'email': 'contact@restroflow.com',
                'gstin': '29ABCDE1234F1Z5'
            }
        })
