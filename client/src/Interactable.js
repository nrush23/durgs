import { AbstractMesh, Mesh, Scene } from "@babylonjs/core";

//Interface for describing the interactable objects
export class Interactable {
    // action(input);
    model;
    scene;

    constructor(scene){
        this.scene = scene;
    }

    onAction(input, right){
        throw new Error('Method onAction(input) must be implemented');
    }
    
    offAction(input, right){
        throw new Error('Method offAction(input) must be implemented');
    }
    
}