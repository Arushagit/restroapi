import os
from django.http import JsonResponse
from django.core.management import call_command
from io import StringIO
from menu.models import FoodCategory

SECRET_KEY = os.environ.get('SEED_SECRET', 'restroflow2024')


def run_seed(request):
    """
    Endpoint to seed initial data.
    Usage: GET /api/run-seed/?key=restroflow2024
    Pass ?force=true to force update user passwords to default.
    """
    if request.GET.get('key') != SECRET_KEY:
        return JsonResponse({'error': 'Forbidden: invalid key'}, status=403)

    force = request.GET.get('force') == 'true'
    if FoodCategory.objects.exists() and not force:
        return JsonResponse({
            'status': 'already_seeded',
            'categories_count': FoodCategory.objects.count(),
            'message': 'Database already has data. Pass ?force=true to re-seed/reset.'
        })

    out = StringIO()
    try:
        call_command('seed_data', stdout=out)
        return JsonResponse({'status': 'success', 'output': out.getvalue()})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
