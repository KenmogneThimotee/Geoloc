import { Component, NgModule, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { CommandeService } from './services/commande.service'
//import getMAC , { isMAC } from 'getmac' ;
//import * as macAddress from "macaddress";





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


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'pharmo';

  produit : Array<Produit> ;
  produit_set = false ;
  query = "";
  lat = 0;
  lon = 0;
  ret : any ;
  quantite = 0;
  panier : any ;
  acpCom = false
  refmotif :string ;
  refCom = false

  origin : any;
  destination: any;
  markers : Array<Object>;
  travelModel = "WALKING"
  routealternative = true
  sch = false
  mapZoom = 13 ;
  minZoom = 40 ;

  public modifiers = {
    arrow : {
      element : '[x-arrow]'
    }
  }

  public renderOptions = {
    suppressMarkers: true,
  }

  public markerOptions = {
    origin: {
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAELklEQVRogdWaT2gcdRTHP292U6xKlF5Mo9SgiBpRD4U2amcbUBNsQZFavIhaGqVaQ6xBCIKo4EGwR2sPxoN4jKAEi9AI3e3kD9WehE0RS2mr7UoPpVRTIcnO89BtIja/mfebmVb8Qi553/fe98tv8vb3Jgv/c0hRhfQRbqfMUwgh0I3SBdzSCl9AOIVSR4ho8p1McbaIvrkNaIU+YkYQNgOBMS0GqgR8JDUm8vTPbEBD+hHeR+nJIwCYIeC9rEa8DehG2lnFPuCFLA0T8AUxgzLFHz5JXga0wj3EjCPc56fNjGOUeFqqHLcmmA1ohQeJmUC4LZs2M34HHpeIWQvZZEAfo5OAI8AdeZR54CxCjxzm1zRi6tTQ9bQRMM71Ew/QiTKmvZTTiOlj70beBdYXocoTG2nyThop8RHSTaxD+Bm4waNxHRglZoKbOAnAHF0E9AEDQLdHrb8Q7k16lJINhHwKvGZsNg8M08F+GaO5Yr3tlGiwG2Ev0Gas+4lEDLqCTgOteX8GuNnQZB5lq0zyvUWRbuZJYg5gM3GR1XTKQeZWCrr/BtroxyYeYNgqHkBqTCC8baS3c4k+V9BtIOAJY4M6Hew3cv9Zfx9wzMSVLAaUh43FP3M984lpVRZRRo30h1yBpDF6l6m05rhNljlo7HG3K5RkoN1UvMRpE28lLHDKxBNudYWSDCwaRWTfKRbNuQuuQJKBc8bi64y8q7HanOvUkmTAdryBe0KkIqbfxFO3FrcBYcooY0C3UzJylzX1UiZmwEQOmHaHnB2IjFq6abDbyF1Gk0HzYpSgxX2VeIBVrKEBrDG0WCBgq3Wv1Qp9KN9iu0qc5zxrpc78SkHnCUideZQxiyCgjZgDWmEo6Q6vvZQ1ZI+HeFDGXOIh/Ta6AThiarSMWZTPWx9SJ1u/6yKmH2UncL9XtYANUuNHVzh1DmtIDah4NS0ONYnoTSKkb2TKx4XJ8YWyN41iW+pDpoBHcwvyww9E9AhoEsn2KjBgpBBJPggYSRN/mWaA1IiAb3KLskL4WmocslCtL2NBGQL+zKrJA5cIeMtKNhuQSU6jfJhNkxc+kOrS+E2F37tRCAg5xLUbqzN0EPpsePZHCBCIUXaA3xtkI+YQXvJdT70MAMgkJ4Bh3zwD3pTD/OKtJ2s3DfkK2JY1/18Yl4hnsiR6n8ASmrwONDLnL6NBk1eyJmc2INOcI2AbuG+KBiwQ8LxMm9fXq5D9BACpMYOyJ0eJodaHZHYNeZKvQDcxirDTM+1LiXgxb+9cJ7CEMm8gHDXzhaOUeLWI1sX9oztkLTAD3JnS8QwBPVLltyL6FnMCgEQ0gC3AhQTaRZQtRYmHAg0ASMQsyrOsPJkWCHhOIn4qsmehBgBkkirCDi5/neAKYoSX836t4LpCQ3ZpSNz62fVf68kErTCilWu7zf0N8egV9FPeVqgAAAAASUVORK5CYII=",
        label : "Vous etes ici !"
    },
    destination: {
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAGmElEQVRoge2ZfYxUVxnGf++d/QJWwTYkdQV2B3bvYo1ESCGYSLQlNqml3QqhxpoKiX80MSUmrW1FynDYAk0tSnH/8CtVqimmARIorWlTa6tpTGq1JjVUdnZhZ4aPogEpWXZhP+Y+/jGXuu7OsntmZv/bJ5nMnXnP877PM+fcc87cA9OYxjSuB6toNmGLc1uX5ZVoA60y7JPAvDh4SnDOxJ8isyPdTe7dSpaujBFhYSZ1L2btQDhJVtpMj3cuaD+IoXIllG1k0SnXnBhmP6blccqsSUfyspcTDGdrZ149DTDQXzfPLGgS9hWZtYEa4/ZvY9yXbnQny9FRlpEwt3UVUeIQaC5wGrMn0guOPYsdyF+XKBe05qJ1UvAUKAn8x7D1nU3uD6VqKdlIa8bdJngFVA124HING882uH6fHEvOfXfWwNX654TWgQ0F4vbjSfdmKXpKMrLolGtO5PU2cINhT3c2usdKHufCwqx7GvQw2AWMFaUMs6CUwolh9gM3gB0oywSAoXSje8SwQ6AbkZ5H/j9wlS+hMDtpuUGut4aNxUw0d22ea9W1mwzW8L9ZLI10lFrrSDe486PN1J67vOHqQP0KpJWtObeuE3fQR5dfjwiLp1gkpYrdE2Em9dWguqbb0FbQUtCs+LUUI8Ug3WGPu2c0772bdvcpirbFuZ/w7RUvI4tzW5cBIVg23RT8ppgJsIPAx012NJDdWlfXV19X11dv6DbgJdBsTIeKmelq+uevDXLA4ubs1s/5aPMaWnkl2gxh0hFsezQy1ty1eS7YPiBA+n5ncvuTo+hvAG+0ZFJbDNuB6VfhWffW/w0zO5BXZtuLwIOBEm3A3yerzfNm1yoAQ78bHbHq2k3EPZFOto828RG6mtp3Ai8BcxjgwSI1CrmtUGuy8DJi0ABAFPSMjemuuM2PJs5je+KLu8fEoiieeu1TPtp8p98GgMTHOFsk1gyQmMVfJ8xytf+dkZyRqKqvOlO40lQasWqAvj6Gi8QmvZbkEzPjGUljOJcGLsXbG0v4KPPtkQ8BZsGcsSGdABjuj5ZPlCRRzS0ABt2jY7M0+xMja00WvkbOAwxYfK+MhHix8GYPTZRE8BCAZEdHx6J8fn58+W8fYb5G3gcwsWRMpNY6wC4Ba1oyqS3jJWjJuMdBdwIfBtUDHaPjFtgSAEPHfIR5rSNG9A9h681YBuwbGUs3uPNhj9uIcciwHWFm20rD9lTN5C8Aw/2sKPSE7gQikzYen/fkhTFFFCwHgek9H22+PfJWXG11sWA66Q4jW0dhfK8Ren2oX71D/eoVev1aT5i0tjPZfqR4CX0ZIB8Ff/QR5mUkP3Txz2B9wM2LurfML9YmnXSHqbEWRLvBu8BlsF6wvyHbHlQNNo9nojnrbgaawC52Nx17p1ib8eA1tLpbOgbCrPs9oi1RlbgX+GFRM4Vtx7b4NWkEkb5W2Crq5Qn/ZY7m+jQGMNgfU7/hy70uhGHcF3/Y70v3NtIXXDpamJ20tLnHrfTlj4cw6+4AmsE+aGgMXvPlexs5PX/PFYOfAwSmR3z548HgUQAUdbxprsjO4frw/6sLKDG0FxgE7gl73OJScoxEa87dIvRFsN5Bgp+UkqMkI+n5O88Y9jwQKNB3SskxEooKvWHoZ5mk89qaXENJRgDyxm6QTLYhPLXFa6c6EvGUuxZsKF9le0vNU7KR7kb3vgpPPmYwXLWrZAFiNygh07Pd89zpkvOUSiyQ848CVzHdH550K3z5YTa1GnQHWG9NZNvL01IGOpt29GA8A2YW8IzXkw+tTxAFewAE7ceS7lw5WsoyAmBXruwCzgl9viXrvj5ZXkvu09/G9FmwExq6MGYX7IuyjXQu/kGvZJsBDH78mR5300ScMOsWmmwXgCl6uLulY6BcHWUbAehKun0UHmjfOBwvluNCLjDxS6AesxfG3wX7oSJGAIbz9gBYr0x3hT2pDeO1a81Fm+LF78JQfrDsNegaKmbk5CKXM0WPAWDB3oUn3ILRbcKsWyjZDgAp2tSzcNe/KlW/YkYAOpvafyqzV0Gzq6v0C+Q+yv8luSqk54B6wcGuZPtvK1m7okYwFA3xTbAPJG4PM6Suhc5ktBP4AnC6JmEPVLQulT7VjdGaSd0qgtdAJnS3jCAQR8AUyFaXeip1PUyJEYAwm9qGzIFdBBkwx0zf62xsf2oq6k2ZkfhI7QXQ+vibw+nG7WsrcRRdDN4nVpOGITve/y3NmNEIUD3D7p8qE9OYxjQmxn8BYPGEuG0p7qYAAAAASUVORK5CYII=",
        label: '',
    },
  }

  search_error = '' ;

  setPosition(dat){
    this.lat = dat['lat'];
    this.lon = dat['lng'];

    this.origin = {"lat": this.lat, "lng":this.lon}

  }

  getUserLocation(){

    let lat;
    let lon;
    let dc;

    let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    return new Promise(() => {

          navigator.geolocation.getCurrentPosition((position) => {
          lat = position.coords.latitude;
          lon = position.coords.longitude;
          dc = {lat: lat, lon: lon}


          this.setPosition(dc);
          console.log(dc)
        },() => {
          console.log("geolocation is not set");
        }, options);

    })

  }

  constructor(private httpclient : HttpClient, public cmdService : CommandeService){

    this.panier = {
      "panier": []
    }

  }


  changeQte(data){
    this.markers[data['index']+1]['quantite'] = data.qte 
  }

  search(){

        console.log("Promise set");

        //let dc = this.getUserLocation().then(this.setPosition);
        console.log("dc")

        //this.lat = dc['lat']
        //this.lon = dc['lon']
        this.sch = true
        this.search_error = ""
        let param = new HttpParams().set("query",this.query).set("lon", this.lon.toString()).set("lat",this.lat.toString());
        this.httpclient.get<Produit[]>("http://127.0.0.1:8000/search/", {"params":param}).subscribe((data) => {
          console.log(data)
           this.sch = false
          this.produit = data;
          this.produit_set = true;
          this.markers = data
          this.cmdService.produit = data


          console.log(this.markers)
        },(error) => {
          this.sch = false
          console.log(error)
          if(error.status == 400){
            this.search_error = error.error.error
            console.log(error.error)
          }
          if(error.status == 500){
            window.alert("Erreur interne du serveur")
          }
        });

  }

/*
  commande(){


    let order = {
      "qte":this.quantite,
      "produitid":this.produit.produit_id,
      "domaine":this.produit.pharmacie_domaine
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };

    this.panier.panier.push(order) ;

    this.httpclient.post("http://127.0.0.1:8000/commande", this.panier, httpOptions).subscribe((data) => {
      console.log(data["success"])
      if(data["success"].length === 0){
        this.acpCom = false
        this.refCom = true
        for(let k in data['erreur']){
          this.refmotif = k
          console.log(data["erreur"][k])
          break;
        }

        this.panier.panier = []

        this.quantite = 0

          setTimeout(()=>{
          this.refCom = false
        }, 5000)
      }else{
        this.acpCom = true
        this.refCom = false

        this.panier.panier = []

        
        if(this.produit.quantite >= this.quantite){
          this.produit.quantite -= this.quantite
        }

        this.quantite = 0

        setTimeout(()=>{
          this.acpCom = false
        }, 5000)
      }

    }, (err) => {
      console.log(err)     
    } )
  }  */

ngOnInit(){
  //this.getUserLocation().then(this.setPosition);

   //const macAddress = require('macaddress')
   /*
   let inetwork = macAddress.networkInterfaces()

   let inetworks = []

   for(let it in inetwork){
     inetworks.push(it)
   }


   for(let it of inetworks){
        macAddress.one(it, function (err, mac) {

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
          })
        };

        let data = {
          "considerIp": "true",
            "wifiAccessPoints": [
            {
              "macAddress": mac
            }

            ]

        }

          this.httpclient.post("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBej_-JrIkgpsoA-oFGXf8JHO9dOKBCkX4",data,httpOptions).subscribe((data) => {
              console.log(data)

              let location = data['location']
              this.setPosition(location)

              //this.lat = location.lat 
              //this.lon = location.lng

              console.log(this.lat)
              console.log(this.lon)
            })



      });

   }*/

   const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
          })
        };

        let data = {
          "considerIp": "true",
            "wifiAccessPoints": [
            {
              "macAddress": "c0:f8:da:1c:f2:45"
            }

            ]

        }

        this.httpclient.post("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBej_-JrIkgpsoA-oFGXf8JHO9dOKBCkX4",data,httpOptions).subscribe((data) => {
      console.log(data)

      let location = data['location']
      this.setPosition(location)

      //this.lat = location.lat 
      //this.lon = location.lng

      console.log(this.lat)
      console.log(this.lon)
    })

  }



}
                                                          