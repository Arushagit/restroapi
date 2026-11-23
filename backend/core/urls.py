from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.seed_view import run_seed

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/menu/', include('menu.urls')),
    path('api/tables/', include('tables.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/run-seed/', run_seed),  # one-time seeder — remove after use
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
