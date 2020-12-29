from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import googlemaps as gp
import json
from django.views import View
from django_tenants.utils import schema_context

from django.db import connection

from .models import *
from myclientapp.models import *

# Create your views here.

def home(request):
    return render(request, 'index.html')


class SearchView(APIView):

    def get(self, request):

        try:
            search_query = request.GET['query']
            #search_query = r'' + search_query + '+'
        except:
            return Response({"error":"You didn't sent query message"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            logitude = request.GET['lon']
        except:
            print("test lon")
            return Response({"error":"You didn't sent longitude"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lattitude = request.GET['lat']
        except:
            return Response({"error":"You didn't sent lattitude"}, status=status.HTTP_400_BAD_REQUEST)

        """try:
            produit = Produit.objects.get(nom=search_query)
        except:
            return Response({"error":"Search query didn't match"}, status=status.HTTP_400_BAD_REQUEST)"""

        
        clients = Client.objects.all()

        produits = []
        prox_client = Client()
        dist_c = 0
        prod_client = list()
        for client in clients:
            with connection.cursor() as cursor:
                schema_name = client.schema_name
                if schema_name == "public":
                    continue   
                #schemas = ",".join([str(client) for client in clients if str(client) != "public"])
                cursor.execute(f"SET search_path TO {schema_name};")
                try:

                    #produit = Produit.objects.raw(f"SET search_path TO {schema_name}; SELECT * FROM myclientapp_produit WHERE nom='{search_query}';")
                    #produit = Produit.objects.get(nom=search_query)
                    produit = Produit.objects.raw(f"SET search_path TO {schema_name}; SELECT * FROM myclientapp_produit WHERE nom='{search_query}';")
                    if produit:
                        print(produit[0])
                        produits = produits + list(produit)
                        prod_client.append(client)
                except Exception as e:
                    print(e)
                    continue
        
        gpClient = gp.Client(key='AIzaSyBej_-JrIkgpsoA-oFGXf8JHO9dOKBCkX4')
        #print(gpClient)
        #print("test",prod_client)

        if len(prod_client) == 1:
            dist = gpClient.distance_matrix(origins=[(lattitude,logitude)], destinations=[(prod_client[0].lattitude,prod_client[0].logitude)])
            dist = dist['rows'][0]['elements'][0]['distance']['value']

            produit = produits
            ret = dict()
            ret["distance"] = dist
            ret['pharmacie_id'] = prod_client[0].id
            ret['pharmacie_domaine'] = prod_client[0].schema_name
            ret['pharmacie_name'] = prod_client[0].name
            ret['produit_id'] = produit[0].id
            ret['lat'] = prod_client[0].lattitude
            ret['lon'] = prod_client[0].logitude
            ret['nom'] = produit[0].nom
            ret['quantite'] = produit[0].quantite
            ret['prix_unit'] = produit[0].prix_unit

            return Response(ret, status=status.HTTP_200_OK)

        if prod_client:
            for client in prod_client:
                #print(client.lattitude)
                dist = gpClient.distance_matrix(origins=[(lattitude,logitude)], destinations=[(client.lattitude,client.logitude)])
                dist = dist['rows'][0]['elements'][0]['distance']['value']
                if dist_c > dist:
                    prod_client = client
                    dist_c = dist
                pass

            print(produits)
            produit = produits
            ret = dict()
            ret["distance"] = dist_c
            ret['pharmacie_id'] = prod_client[0].id
            ret['pharmacie_domaine'] = prod_client[0].schema_name
            ret['pharmacie_name'] = prod_client[0].name
            ret['produit_id'] = produit[0].id
            ret['lat'] = prod_client[0].lattitude
            ret['lon'] = prod_client[0].logitude
            ret['nom'] = produit[0].nom
            ret['quantite'] = produit[0].quantite
            ret['prix_unit'] = produit[0].prix_unit

            return Response(ret, status=status.HTTP_200_OK)

        else:
            return Response({"error":"Search query didn't match"}, status=status.HTTP_400_BAD_REQUEST)


class CommandeView(APIView):

    def post(self, request):

        #return Response(request.data)
        panier = request.data['panier']
        if not panier:
            return Response({"error":"You didn't set panier"}, status=status.HTTP_400_BAD_REQUEST)
        print(panier)
        echec = dict()
        success = list()
        for items in panier:
            produit_id = items['produitid']
            schema = items['domaine']
            qte = items['qte']
            with connection.cursor() as cursor:
                cursor.execute(f"SET search_path to {schema}")
                try:
                    #produit = Produit.objects.get(id=produit_id)
                    try:
                        produit = Produit.objects.raw(f"SET search_path TO {schema};SELECT * FROM myclientapp_produit WHERE id={produit_id};")[0]
                    except:
                        echec[f"le produit n'existe pas pour le domaine {schema}"] = items
                        continue
                    if int(qte) > produit.quantite:
                        echec["La quantie commande est superieur a celle du stock"] = items
                        continue
                        #return Response({"error":"la quatite commande est superieur aux stocks"}, status=status.HTTP_400_BAD_REQUEST)
                    #commande = Commande()
                    data = Commande.objects.raw(f"SET search_path TO {schema}; SELECT * FROM myclientapp_commande ;")
                    ids = -1
                    if len(data) >= 1:
                        ids = max([ commande.id for commande in data])
                        print(ids)
                    else:
                        ids = -1
                    cursor.execute(f"SET search_path TO {schema}; INSERT INTO myclientapp_commande (id) VALUES({int(ids)+1});")
                    commande = Commande.objects.raw(f"SET search_path TO {schema}; SELECT * FROM myclientapp_commande WHERE id={int(ids)+1};")[0]

                    data = ProduitCommande.objects.raw(f"SET search_path TO {schema}; SELECT * FROM myclientapp_produitcommande ;")
                    ids = -1
                    if len(data) >= 1:
                        ids = max([ pc.id for pc in data])
                        print(ids)
                    else:
                        ids = -1

                    cursor.execute(f"SET search_path TO {schema}; INSERT INTO myclientapp_produitcommande (id, qte, commande_id, produit_id) VALUES({int(ids)+1},{qte},{commande.id},{produit.id});")
                    up = produit.quantite - qte
                    cursor.execute(f"SET search_path TO {schema}; UPDATE myclientapp_produit SET quantite={up} WHERE id={produit.id};")
                    success.append(items)
                except Exception as e:
                    print(e)
                    continue
        
        
        return Response({"erreur":echec,"success":success}, status=status.HTTP_200_OK)
        
        #return Response({"message":"Commande accepter"}, status=status.HTTP_200_OK)



