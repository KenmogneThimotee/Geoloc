from django.db import models

# Create your models here.



class Produit(models.Model):
    nom = models.CharField(max_length=100)
    quantite = models.PositiveIntegerField()
    prix_unit = models.DecimalField(max_digits=100, decimal_places=2)


    def __str__(self):
        return self.nom

        
class Commande(models.Model):
    produit = models.ManyToManyField(Produit, through='ProduitCommande')


class ProduitCommande(models.Model):
    qte = models.PositiveIntegerField()
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE)
