import { Injectable } from '@angular/core';

declare interface ProduitQte{
	id: number ;
	quantite: number ;
}

declare interface Produit{
  distance : number;
  pharmacie_id: number;
  pharmacie_domaine: string;
  pharmacie_name: string;
  produit_id: number;
  lat: number;
  lon: number;
  nom: string;
  quantite : number;
  prix_unit: number;
}


@Injectable({
  providedIn: 'root'
})
export class CommandeService {


	acpCom : Boolean ;
	refCom : Boolean ;
	refmotif : string ;

	produit : Produit[] ;


  constructor() { }
}
