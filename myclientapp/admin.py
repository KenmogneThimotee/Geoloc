from django.contrib import admin
from .models import Person, Produit, ProduitCommande, Commande
# Register your models here.

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    pass

@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    pass

@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    pass

@admin.register(ProduitCommande)
class ProsuitCommandeAdmin(admin.ModelAdmin):
    pass
