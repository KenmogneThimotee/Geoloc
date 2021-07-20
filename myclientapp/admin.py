from django.contrib import admin
from .models import Produit, ProduitCommande, Commande
# Register your models here.



@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    pass

@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    pass

@admin.register(ProduitCommande)
class ProsuitCommandeAdmin(admin.ModelAdmin):
    pass
