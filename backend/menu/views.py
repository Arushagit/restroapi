from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import FoodCategory, FoodItem
from .serializers import FoodCategorySerializer, FoodItemSerializer
from core.permissions import IsAdminOrReadOnly


class FoodCategoryViewSet(viewsets.ModelViewSet):
    queryset = FoodCategory.objects.all().order_by('name')
    serializer_class = FoodCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    pagination_class = None  # Return all categories for UI dropdowns and tabs

    def get_authenticators(self):
        if self.request.method in permissions.SAFE_METHODS:
            return []
        return super().get_authenticators()


class FoodItemViewSet(viewsets.ModelViewSet):
    queryset = FoodItem.objects.select_related('category').all().order_by('-created_at')
    serializer_class = FoodItemSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'food_type', 'is_available', 'is_featured']
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'name', 'created_at']
    pagination_class = None  # Or disabled for smooth responsive filtering on frontend

    def get_authenticators(self):
        if self.request.method in permissions.SAFE_METHODS:
            return []
        return super().get_authenticators()
