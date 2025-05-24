from django.db import models

# Create your models here.

class Feed(models.Model):
    feed_id = models.AutoField(primary_key=True)
    feed_type = models.TextField()
    quantity = models.IntegerField()

class Medicine(models.Model):
    medicine_id = models.AutoField(primary_key=True)
    medicine_name = models.TextField()
    quantity = models.IntegerField()
    expiry_date = models.DateField()

class Breed(models.Model):
    breed_id = models.AutoField(primary_key=True)
    breed_name = models.TextField()

class ChickenBatch(models.Model):
    batch_id = models.AutoField(primary_key=True)
    batch_name = models.TextField()
    batch_age = models.TextField()
    weight = models.FloatField()
    isHealthGood = models.BooleanField(default=True)
    Date_Arrived = models.DateField()
    Date_Released = models.DateField(null=True, blank=True)
    breed = models.ForeignKey(Breed, on_delete=models.CASCADE)

class GrowthLog(models.Model):
    log_id = models.AutoField(primary_key=True)
    log_date = models.DateField()
    batch = models.ForeignKey(ChickenBatch, on_delete=models.CASCADE)
    weight = models.FloatField()
    isHealthGood = models.BooleanField(default=True)
    feed = models.ForeignKey(Feed, on_delete=models.SET_NULL, null=True, blank=True)
    medicine = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, blank=True)

class User(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    isAdmin = models.BooleanField(default=False)
