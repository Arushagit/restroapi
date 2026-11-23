from rest_framework import viewsets, permissions, filters
from .models import RestaurantTable
from .serializers import RestaurantTableSerializer


class RestaurantTableViewSet(viewsets.ModelViewSet):
    queryset = RestaurantTable.objects.all().order_by('table_number')
    serializer_class = RestaurantTableSerializer
    pagination_class = None

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
