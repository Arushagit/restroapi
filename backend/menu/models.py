from django.db import models


class FoodCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Food Categories'

    def __str__(self):
        return self.name


class FoodItem(models.Model):
    VEG = 'veg'
    NON_VEG = 'non_veg'
    TYPE_CHOICES = [(VEG, 'Vegetarian'), (NON_VEG, 'Non-Vegetarian')]

    category = models.ForeignKey(FoodCategory, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='food/', blank=True, null=True)
    food_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=VEG)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - Rs.{self.price}"
