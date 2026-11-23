from rest_framework import serializers
from .models import FoodCategory, FoodItem


class FoodCategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = FoodCategory
        fields = ['id', 'name', 'description', 'image', 'is_active', 'items_count', 'created_at']

    def get_items_count(self, obj):
        return obj.items.count()


class FoodItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = FoodItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description',
            'price', 'image', 'food_type', 'is_available', 'is_featured',
            'created_at', 'updated_at'
        ]
