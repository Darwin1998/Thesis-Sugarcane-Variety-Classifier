import * as tf from '@tensorflow/tfjs';
import { conv2d } from '@tensorflow/tfjs-layers/dist/exports_layers';

tf.sequential({
    layers: tf.layers(conv2d)

});