from django.shortcuts import render, get_object_or_404, redirect
from .models import *
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils.dateparse import parse_date

def Poultry(request):
  return render(request,"select.html")

def password(request):
  return render(request,"password.html")


def main(request):
    # Get all chicken batches with related breed information
    batches = ChickenBatch.objects.select_related('breed').all()
    
    # Calculate weeks for each batch (assuming batch_age is in days)
    for batch in batches:
        try:
            batch.weeks = int(batch.batch_age) // 7  # Convert days to weeks
        except (ValueError, TypeError):
            batch.weeks = 0
    
    context = {
        'batches': batches,
    }
    return render(request, "main.html", context)


def batchlog(request):
    batches = ChickenBatch.objects.all()
    breeds = Breed.objects.all()
    return render(request, 'batchlog.html', {
        'batches': batches,
        'breeds': breeds
    })

def user(request):
  # Get all chicken batches with related breed information
    batches = ChickenBatch.objects.select_related('breed').all()
    
    # Calculate weeks for each batch (assuming batch_age is in days)
    for batch in batches:
        try:
            batch.weeks = int(batch.batch_age) // 7  # Convert days to weeks
        except (ValueError, TypeError):
            batch.weeks = 0
    
    context = {
        'batches': batches,
    }
    return render(request, "user.html", context)

@csrf_exempt
def add_batch(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        breed = Breed.objects.filter(pk=data.get('breed_id')).first()
        if not breed:
            return JsonResponse({'error': 'Invalid breed ID'}, status=400)

        batch = ChickenBatch.objects.create(
            batch_name=data.get('batch_name'),
            batch_age=data.get('batch_age'),
            weight=data.get('weight', 0),
            isHealthGood=data.get('isHealthGood', True),
            Date_Arrived=parse_date(data.get('Date_Arrived')),
            Date_Released=parse_date(data.get('Date_Released')) if data.get('Date_Released') else None,
            breed=breed
        )
        return JsonResponse({'message': 'Batch added', 'batch_id': batch.batch_id})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def update_batch(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        batch = ChickenBatch.objects.filter(pk=data.get('batch_id')).first()
        if not batch:
            return JsonResponse({'error': 'Batch not found'}, status=404)

        batch.batch_age = data.get('batch_age', batch.batch_age)
        batch.isHealthGood = data.get('isHealthGood', batch.isHealthGood)
        batch.save()
        return JsonResponse({'message': 'Batch updated'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def delete_batch(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        batch = ChickenBatch.objects.filter(pk=data.get('batch_id')).first()
        if not batch:
            return JsonResponse({'error': 'Batch not found'}, status=404)
        batch.delete()
        return JsonResponse({'message': 'Batch deleted'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def get_breeds(request):
    breeds = Breed.objects.all().values('breed_id', 'breed_name')
    return JsonResponse({'breeds': list(breeds)})

def growthlog(request):
    growthlogs = GrowthLog.objects.select_related('batch', 'feed', 'medicine').all()
    batches = list(ChickenBatch.objects.values('batch_id', 'batch_name'))
    feeds = list(Feed.objects.values('feed_id', 'feed_type'))
    medicines = list(Medicine.objects.values('medicine_id', 'medicine_name'))

    context = {
        'growthlogs': growthlogs,
        'batches': batches,
        'feeds': feeds,
        'medicines': medicines
    }
    return render(request, 'growthlog.html', context)

def growthlog_list(request):
    logs = GrowthLog.objects.all()
    return render(request, 'growthlog_list.html', {'logs': logs})

@csrf_exempt
def add_growthlog(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            log = GrowthLog.objects.create(
                batch_id=data['batch'],
                isHealthGood=data['isHealthGood'],
                weight=data['weight'],
                feed_id=data['feed'] or None,
                medicine_id=data['medicine'] or None,
                log_date=data['log_date']
            )
            return JsonResponse({'success': True, 'log_id': log.log_id})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def save_growthlog(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        try:
            log = GrowthLog.objects.get(log_id=data['log_id'])
            log.batch_id = data['batch']
            log.isHealthGood = data['isHealthGood']
            log.weight = data['weight']
            log.feed_id = data['feed'] or None
            log.medicine_id = data['medicine'] or None
            log.log_date = data['log_date']
            log.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def update_growthlog(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            log_id = data.get('log_id')
            
            # If log_id is not provided, create a new GrowthLog
            if log_id:
                log = GrowthLog.objects.get(log_id=log_id)
            else:
                log = GrowthLog()

            log.batch = ChickenBatch.objects.get(batch_id=data['batch'])
            log.weight = data['weight']
            log.isHealthGood = data['isHealthGood']
            log.feed = Feed.objects.get(feed_id=data['feed']) if data['feed'] else None
            log.medicine = Medicine.objects.get(medicine_id=data['medicine']) if data['medicine'] else None
            log.log_date = data['log_date']
            log.save()

            return JsonResponse({"success": True, "log_id": log.log_id})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Invalid request method"})


@csrf_exempt
def delete_growthlog(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            log_id = data.get('log_id')
            log = GrowthLog.objects.get(log_id=log_id)
            log.delete()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Invalid request method"})

def inventory(request):
    feeds = list(Feed.objects.values('feed_id', 'feed_type', 'quantity'))
    medicines = list(Medicine.objects.values('medicine_id', 'medicine_name', 'quantity', 'expiry_date'))

    # Convert expiry_date to string
    for med in medicines:
        if med['expiry_date']:
            med['expiry_date'] = med['expiry_date'].strftime('%Y-%m-%d')
        else:
            med['expiry_date'] = ''  # or set a default date if needed

    return render(request, "inventory.html", {
        'feeds': json.dumps(feeds),
        'medicines': json.dumps(medicines),
    })


def get_inventory_data(request):
    feeds = list(Feed.objects.values('feed_id', 'feed_type', 'quantity'))
    medicines = list(Medicine.objects.values('medicine_id', 'medicine_name', 'quantity', 'expiry_date'))
    return JsonResponse({'feeds': feeds, 'medicines': medicines})

@csrf_exempt
def update_inventory(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            item_type = data.get('type')
            items = data.get('data', [])

            if item_type == 'feed':
                for item in items:
                    Feed.objects.update_or_create(
                        feed_type=item['feed_type'],
                        defaults={'quantity': item['quantity']}
                    )
            elif item_type == 'medicine':
                for item in items:
                    Medicine.objects.update_or_create(
                        medicine_name=item['medicine_name'],
                        defaults={
                            'quantity': item['quantity'],
                            'expiry_date': item['expiry_date']
                        }
                    )
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)


@csrf_exempt
def delete_inventory(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        item_id = data.get('id')
        item_type = data.get('type')

        try:
            if item_type == 'feed':
                Feed.objects.filter(feed_id=item_id).delete()
            elif item_type == 'medicine':
                Medicine.objects.filter(medicine_id=item_id).delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)