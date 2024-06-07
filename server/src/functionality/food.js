import { AbstractMesh, Mesh, Scene } from '@babylonjs/core';
import { Interactable } from './Interactable';
export const cook_state = { raw: 'RAW', perfect: 'PERFECT', burnt: 'BURNT' };
export class Food extends Interactable {
    model;
    scene;
    //We will overlay a color darkener based on the cook state
    doneness;
    cook_time;
    body;
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.cook_time = 0;
    }

    cook() {

    }
    
}