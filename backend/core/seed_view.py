"""
One-time seed endpoint — called via GET /api/run-seed/?key=restroflow2024
Automatically disabled once data exists.
"""
import os
from django.http import JsonResponse
from django.core.management import call_command
from io import StringIO

SECRET_KEY = os.environ.get('SEED_SECRET', 'restroflow2024')


def run_seed(request):
    if request.GET.get('key') != SECRET_KEY:
        return JsonResponse({'error': 'Forbidden'}, status=403)

    # Check if already seeded
    try:
        from menu.models import FoodCategory
        if FoodCategory.objects.exists():
            return JsonResponse({'status': 'already_seeded', 'categories': FoodCategory.objects.count()})
    except Exception:
        pass

    out = StringIO()
    try:
        call_command('seed_data', stdout=out)
        return JsonResponse({'status': 'success', 'output': out.getvalue()})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
