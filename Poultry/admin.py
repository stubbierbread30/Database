from django.contrib import admin
from .models import Feed, Medicine, Breed, ChickenBatch, GrowthLog, User

admin.site.register(Feed)
admin.site.register(Medicine)
admin.site.register(Breed)
admin.site.register(ChickenBatch)
admin.site.register(GrowthLog)
admin.site.register(User)
