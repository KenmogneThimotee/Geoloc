
from django.contrib import admin
from django.urls import path, include
from .views import *

urlpatterns = [
    path('', home,name="search" ),
    path('search/', SearchView.as_view(), name="searchapi"),
    path('commande', CommandeView.as_view()),
]
