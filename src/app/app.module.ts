import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { ImageCropperModule } from 'ngx-image-cropper';
import { Crop } from '@ionic-native/crop';



@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    Camera,
    ImageCropperModule,
    
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
