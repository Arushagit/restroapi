from django.contrib import admin
from .models import FoodCategory, FoodItem


@admin.register(FoodCategory)
class FoodCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'food_type', 'is_available', 'is_featured')
    list_filter = ('category', 'food_type', 'is_available', 'is_featured')
    search_fields = ('name', 'description')
