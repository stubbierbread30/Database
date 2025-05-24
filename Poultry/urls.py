from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from .views import save_growthlog,add_growthlog

urlpatterns = [
    path('Poultry/', views.Poultry, name='Poultry'),
    path('select/', auth_views.LoginView.as_view(), name='select'),
    path('password/', views.password, name="password"),
    path('main/', views.main, name="main"),
    path('batchlog/', views.batchlog, name="batchlog"),
    path('batchlog/add/', views.add_batch, name='add_batch'),
    path('batchlog/update/<int:batch_id>/', views.update_batch, name='update_batch'),
    path('batchlog/delete/<int:batch_id>/', views.delete_batch, name='delete_batch'),
    path('batchlog/breeds/', views.get_breeds, name='get_breeds'),
    path('inventory/', views.inventory, name='inventory'),
    path('inventory/data/', views.get_inventory_data, name='inventory_data'),
    path('inventory/update/', views.update_inventory, name='inventory_update'),
    path('inventory/delete/', views.delete_inventory, name='inventory_delete'),
    path('growthlog/', views.growthlog, name="growthlog"),
    path('add-growthlog/', add_growthlog, name='add_growthlog'),
    path('save-growthlog/', save_growthlog, name='save_growthlog'),
    path('growthlog/update/', views.update_growthlog, name='update_growthlog'),
    path('growthlog/delete/', views.delete_growthlog, name='delete_growthlog'),
    path('user/', views.user, name="user"),
]
