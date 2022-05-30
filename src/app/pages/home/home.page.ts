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

  result: string = null;

  constructor(private toastService: ToastController) { }

  ngOnInit() {
  }

 ionViewDidEnter() {
    console.log(this.file);

    
   tf.loadLayersModel('/assets/model/otherModel/model.json').then(model => {
      this.model = model;
      
      this.toast("Model was loaded successfully");
    })
    .catch(e => {
      console.log(e);
      this.toast("Error loading model");
    });

  }

  setFile() {
    const input: HTMLInputElement = this.file.nativeElement;
    this.hasValidImage = false;

    this.result = null;


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

      let tensor = tf.browser.fromPixels(this.rescaleImg(this.imagePreview.nativeElement), 3)
        .resizeNearestNeighbor([200, 200]) // change the image size
        .expandDims()
        .toFloat().reverse(-1);

      let predictions = this.model.classify(tensor) as any;

      const d = await predictions.data() as [];
      console.log(d);

      let top5 = Array.from(d)
        .map(function (p, i) { // this is Array.map
          return {
            probability: p,
            className: TARGET_CLASSES[i] // we are selecting the value from the obj
          };
        })
        .sort(function (a: any, b: any) {
          return b.probability - a.probability;
        }).slice(0,5) as any[];

      console.log(top5);
      this.result = top5[0].className;
      
      

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

   rescaleImg(img) {
    var cv = require('opencv.js');
    const src = cv.imread(img);
    let dst = new cv.Mat();
    
    // rescale by 1/255, and hold values in a matrix with float32 data type
    src.convertTo(dst, cv.CV_32F, 1./255.); 
    return src;
    
    
  }
}
