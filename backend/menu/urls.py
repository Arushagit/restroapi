from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FoodCategoryViewSet, FoodItemViewSet

router = DefaultRouter()
router.register(r'categories', FoodCategoryViewSet, basename='food-category')
router.register(r'items', FoodItemViewSet, basename='food-item')

urlpatterns = [
    path('', include(router.urls)),
]

