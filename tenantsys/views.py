from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import googlemaps as gp
import json
from django.views import View
from django_tenants.utils import schema_context
import math

from django.db import connection

from .models import *
from myclientapp.models import *

# Create your views here.

def home(request):

    if request.user_agent.is_pc:
        print(request.user_agent.os.family)
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

        prox_client = Client()
        dist_c = math.inf
        prod_client = list()
        for client in clients:
            if client.schema_name == "public":
                continue
            with schema_context(client.schema_name):
                try:
                    produit = Produit.objects.filter(quantite__gt=0).get(nom=search_query)
                    prod_client.append(client)
                except Exception as e:
                    print(e)
                    continue

        if request.user_agent.is_pc:
            ret = list()
            print([name.schema_name for name in prod_client])
            for client in prod_client:
                with schema_context(client.schema_name):
                    re = dict()
                    re['pharmacie_id'] = client.id
                    re['pharmacie_domaine'] = client.schema_name
                    re['pharmacie_name'] = client.name
                    re['produit_id'] = produit.id
                    re['lat'] = client.lattitude
                    re['lon'] = client.logitude
                    re['nom'] = produit.nom
                    re['quantite'] = produit.quantite
                    print(produit.quantite)
                    re['prix_unit'] = produit.prix_unit

                    ret.append(re)

            return Response(ret)

        gpClient = gp.Client(key='AIzaSyBej_-JrIkgpsoA-oFGXf8JHO9dOKBCkX4')

        if len(prod_client) == 1:
            with schema_context(prod_client[0].schema_name):
                try:
                    dist = gpClient.distance_matrix(origins=[(lattitude,logitude)], destinations=[(prod_client[0].lattitude,prod_client[0].logitude)])
                except:
                    print("first")
                    return Response({"error":"connection echoue a googlemaps"}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    dist = dist['rows'][0]['elements'][0]['distance']['value']
                except Exception as e:
                    print("second")
                    print(dist)
                    if dist['rows'][0]['elements'][0]['status'] == 'ZERO_RESULTS':
                        return Response({"error":"Il n'est pas possible estime les distances "}, status=status.HTTP_400_BAD_REQUEST)
                    return Response({"error":"connection echoue a googlemaps"}, status=status.HTTP_400_BAD_REQUEST)

                ret = dict()
                ret["distance"] = dist
                ret['pharmacie_id'] = prod_client[0].id
                ret['pharmacie_domaine'] = prod_client[0].schema_name
                ret['pharmacie_name'] = prod_client[0].name
                ret['produit_id'] = produit.id
                ret['lat'] = prod_client[0].lattitude
                ret['lon'] = prod_client[0].logitude
                ret['nom'] = produit.nom
                ret['quantite'] = produit.quantite
                ret['prix_unit'] = produit.prix_unit

            return Response(ret, status=status.HTTP_200_OK)

        if prod_client:
            for client in prod_client:
                with schema_context(client.schema_name):
                    try:
                        dist = gpClient.distance_matrix(origins=[(lattitude,logitude)], destinations=[(client.lattitude,client.logitude)])
                    except:

                        return Response({"error":"connection echoue a googlemaps"}, status=status.HTTP_400_BAD_REQUEST)
                    try:
                        dist = dist['rows'][0]['elements'][0]['distance']['value']
                    except:
                        return Response({"error":"connection echoue a googlemaps"}, status=status.HTTP_400_BAD_REQUEST)
                    if dist_c > dist:
                        prod_client = client
                        dist_c = dist
                        prox_client = client
                    pass

            with schema_context(prox_client.schema_name):
                ret = dict()
                ret["distance"] = dist_c
                ret['pharmacie_id'] = prox_client.id
                ret['pharmacie_domaine'] = prox_client.schema_name
                ret['pharmacie_name'] = prox_client.name
                ret['produit_id'] = produit.id
                ret['lat'] = prox_client.lattitude
                ret['lon'] = prox_client.logitude
                ret['nom'] = produit.nom
                ret['quantite'] = produit.quantite
                ret['prix_unit'] = produit.prix_unit

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
            try:
                produit_id = items['produitid']
            except:
                echec["erreur de cle"] = items
                continue
            try:
                schema = items['domaine']
            except:
                echec["erreur de cle"] = items
                pass
            try:
                qte = items['qte']
            except:
                echec["erreur de cle"] = items
                pass
            with schema_context(schema):
                try:
                    try:
                        produit = Produit.objects.get(id=produit_id)
                    except:
                        echec[f"le produit n'existe pas pour le domaine {schema}"] = items
                        continue
                    if int(qte) > produit.quantite:
                        echec["La quantie commande est superieur a celle du stock"] = items
                        continue

                    if int(qte) == 0:
                        echec["On ne peut pas faire une commande d'une quantite null"] = items
                        continue

                    if int(qte) < 0:
                        echec["On ne peut pas faire une commande d'une quantite inferieur a zeros"] = items
                        continue

                    commande = Commande()
                    commande.save()
                    print("commande")
                    produit_c = ProduitCommande()
                    produit_c.commande = commande
                    produit_c.produit = produit
                    produit_c.qte = qte
                    produit.quantite = produit.quantite - qte
                    produit.save()

                    print("la quantite")
                    print(produit.quantite)
                    produit_c.save()
                    success.append(items)
                except Exception as e:
                    print(e)
                    continue


        return Response({"erreur":echec,"success":success}, status=status.HTTP_200_OK)
