import { Component, OnInit, Input, Output } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http'
import { CommandeService } from '../services/commande.service'
import { EventEmitter } from '@angular/core'
			
@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.css']
})
export class CommandeComponent implements OnInit {


	@Input() nom : string ;
	@Input() pharmacie_name: string ;
	@Input() quantite : number ;
	@Input() prix : number ;
	@Input() latitude : number;
	@Input() longitude : number ;
	@Input() produit_id : number ;
	@Input() pharmacie_domaine: string ;
	@Input() index : number ;

	qtecmd : number ;

	panier : Object ;
	@Output() cmdEvent : EventEmitter<Object> ;

	link = "../../assets/images/pharmacie1.png";

  constructor(private httpclient: HttpClient, private cmdService: CommandeService) {

  	this.panier = {
  		panier: []
  	}

  	this.cmdEvent = new EventEmitter() ;

   }

  ngOnInit(): void {
  }

  
  commande(){


    let order = {
      "qte":this.qtecmd,
      "produitid":this.produit_id,
      "domaine":this.pharmacie_domaine
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };

    this.panier['panier'].push(order) ;

    this.httpclient.post("http://127.0.0.1:8000/commande", this.panier, httpOptions).subscribe((data) => {
      console.log(data["success"])
      if(data["success"].length === 0){
        this.cmdService.acpCom = false
        this.cmdService.refCom = true
        for(let k in data['erreur']){
          this.cmdService.refmotif = k
          console.log(data["erreur"][k])
          break;
        }

        this.panier['panier'] = []


          setTimeout(()=>{
          this.cmdService.refCom = false
        }, 5000)
      }else{
        this.cmdService.acpCom = true
        this.cmdService.refCom = false

        order['index'] = this.index

        this.cmdEvent.emit(order)

        this.panier['panier'] = []

        
        if(this.cmdService.produit[this.index].quantite >= this.qtecmd){
          this.cmdService.produit[this.index].quantite -= this.qtecmd

          this.quantite = this.cmdService.produit[this.index].quantite
        }


        setTimeout(()=>{
          this.cmdService.acpCom = false
        }, 5000)
      }

    }, (err) => {
      console.log(err)     
    } )
  }  

}
