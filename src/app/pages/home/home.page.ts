import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ToastController} from '@ionic/angular';
import * as tf from '@tensorflow/tfjs';
import {TARGET_CLASSES} from './target_classes';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { PhotoService } from 'src/app/services/photo.service';



@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  hasValidImage = false;

  imgURL;


  model = null;

  @ViewChild("canvas") canvas: ElementRef = null;

  file: any = null;

  @ViewChild('inputFileElement', {static: true}) inputFileElement: ElementRef;
  @ViewChild('imagePreview', {static: true}) imagePreview: ElementRef;

  result: string = null;
 

 
  constructor(private toastService: ToastController,
              private camera: Camera,
              public photoService: PhotoService) {
  }
 

  ngOnInit() {
  }

    options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }
  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  getCamera(){
    this.camera.getPicture(this.options).then((res)=>{
      this.imgURL = 'data:image/jpeg;base64,' + res;
    }).catch(e => {
      console.log(e);
    })
  }



  ionViewDidEnter() {
    console.log(this.inputFileElement);


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
    const input: HTMLInputElement = this.inputFileElement.nativeElement;
    this.hasValidImage = false;

    this.result = null;
    this.file = null;


    if (input.files.length > 0) {

      const file = input.files[0];

      this.file = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.nativeElement.src = reader.result as string;
        this.hasValidImage = true;


        const newImg = new Image();

        newImg.onload = () => {
          const height = newImg.height;
          const width = newImg.width;


          const scale = 1;

          this.canvas.nativeElement.width = this.imagePreview.nativeElement.naturalWidth * scale;
          this.canvas.nativeElement.height = this.imagePreview.nativeElement.naturalHeight * scale;

          const context = this.canvas.nativeElement.getContext('2d');
          context.drawImage(this.imagePreview.nativeElement, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);


          // console.log(this.canvas.nativeElement)

          this.classify();

        }

        newImg.src = this.imagePreview.nativeElement.src




      };
      reader.readAsDataURL(file);


    } else {
      this.imagePreview.nativeElement.src = "/assets/images/placeholder.jpg";
    }
  }

  triggerInputFile() {
    this.inputFileElement.nativeElement.click();
  }

  triggerModel() {
    alert("this is a model woohoo");
  }

  async classify() {

    if (this.model === null) {
      this.toast("No model loaded");
      return;
    }



    if (this.file) {

      let tensor = tf.browser.fromPixels(this.canvas.nativeElement, 3)
        .resizeNearestNeighbor([200, 200]) // change the image size
        .expandDims()
        // .toFloat()
        .reverse(-1);

      let predictions = this.model.predict(tensor) as any;

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
        }).slice(0, 5) as any[];

      console.log(top5);
      this.result = top5[0].className;


    } else {
      // No file selected
      this.toast("Please select an image first.");
    }

  }


  toast(message: string) {

    this.toastService.create({
      message: message,
      duration: 3000
    }).then(toast => {
      toast.present();
    });
  }

  // rescaleImg(img) {
  //   var cv = require('opencv.js');
  //   const src = cv.imread(img);
  //   let dst = new cv.Mat();
  //
  //   // rescale by 1/255, and hold values in a matrix with float32 data type
  //   src.convertTo(dst, cv.CV_32F, 1. / 255.);
  //   return src;
  //
  //
  // }

  // getImageData(img) {
  //   ctx.drawImage(img, 0, 0);
  //   imageData = ctx.getImageData(0, 0, img.width, img.height).data;
  //   console.log("image data:", imageData);
  // }
}
