import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { hexToLong } from '@tensorflow/tfjs-core/dist/hash_util';
import * as tf from '@tensorflow/tfjs';
import { TARGET_CLASSES } from './target_classes';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  hasValidImage = false;

  model = null;

  @ViewChild('file', { static: true }) file: ElementRef;
  @ViewChild('imagePreview', { static: true }) imagePreview: ElementRef;

  constructor(private toastService: ToastController) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    console.log(this.file);

    
    tf.loadLayersModel('/assets/model/model.json').then(model => {
      this.model = model;
      this.toast("Model was loaded successfully");
    })
    .catch(e => {
      this.toast("Error loading model");
    });

  }

  setFile() {
    const input: HTMLInputElement = this.file.nativeElement;
    this.hasValidImage = false;


    if (input.files.length > 0) {

      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        var output = document.getElementById('output');
        this.imagePreview.nativeElement.src = reader.result as string;
        this.hasValidImage = true;
      };
      reader.readAsDataURL(file);


    }

    else {
      this.imagePreview.nativeElement.src = "/assets/images/placeholder.jpg";
    }
  }

  triggerInputFile() {
    this.file.nativeElement.click();
  }

  triggerModel() {
    alert("this is a model woohoo");
  }

  async classify() {

    if (this.model === null) {
      this.toast("No model loaded");
      return;
    }

    const input: HTMLInputElement = this.file.nativeElement;
    this.toast("Loading model...");


    if (input.files.length > 0) {

      // const file = input.files[0];

      console.log(this.imagePreview.nativeElement);
      

      let tensor = tf.browser.fromPixels(this.imagePreview.nativeElement, 3)
        .resizeNearestNeighbor([250, 250]) // change the image size
        .expandDims();



      let predictions = this.model.predict(tensor) as any;
      console.log("Predictions: ", predictions.data(), predictions.shape);

      this.toast("Done processing predictions...");

      let top5 = Array.from(predictions.data())
        .map(function (p, i) { // this is Array.map
          return {
            probability: p,
            className: TARGET_CLASSES[i] // we are selecting the value from the obj
          };
        })
        .sort(function (a: any, b: any) {
          return b.probability - a.probability;
        });

      console.log(top5);

    }

    else {
      // No file selected
      this.toast("Please select an image first.");
    }

  }


  toast(message: string) {

    this.toastService.create({
      message: message,
    }).then(toast => {
      toast.present();
    })
  }
}
