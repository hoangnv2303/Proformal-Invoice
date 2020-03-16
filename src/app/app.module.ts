import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

// Fire base
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFirestoreModule  } from '@angular/fire/firestore';

import { AngularFireModule } from '@angular/fire';
import { FirebaseService } from './services/firebase.service';
import { environment } from '../environments/environment';
import 'zone.js'

import { AngularFireStorageModule } from '@angular/fire/storage';
import 'firebase/storage';

// Resize image
import {NgxImageCompressService} from 'ngx-image-compress';
import { ImgurApiService } from './services/imgur-api.service';
import {HttpClientModule} from '@angular/common/http';

// Reactive Form Module
import { ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// RECOMMENDED
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// Comfirm Alert
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';

// Alert
import { NotifierModule, NotifierOptions } from 'angular-notifier';



const customNotifierOptions: NotifierOptions = {
  position: {
		horizontal: {
			position: 'right',
			distance: 12
		},
		vertical: {
			position: 'top',
			distance: 100,
			gap: 10
		}
	},
  theme: 'material',
  behaviour: {
    autoHide: 3000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};




@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    NotifierModule.withConfig(customNotifierOptions)
    ,HttpClientModule
  ],
  providers: [FirebaseService,AngularFirestore,AngularFirestoreModule,BsModalService, NgxImageCompressService, ImgurApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }



