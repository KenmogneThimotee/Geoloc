import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { MatCardModule } from '@angular/material/card'; 
import {  MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPopper } from 'angular-popper';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBej_-JrIkgpsoA-oFGXf8JHO9dOKBCkX4'
    }),
    BrowserAnimationsModule,
    AgmDirectionModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NgxPopper
   // agm-direction
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
