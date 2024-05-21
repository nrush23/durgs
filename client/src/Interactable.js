import { AbstractMesh, Mesh, Scene } from "@babylonjs/core";

//Interface for describing the interactable objects
export class Interactable {
    // action(input);
    model;
    scene;

    constructor(scene){
        this.model = new Mesh();
        this.scene = scene;
    }

    action(input){
        throw new Error('Method action(input) must be implemented');
    }
}