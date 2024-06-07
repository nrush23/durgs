import { AbstractMesh, Mesh, Scene } from "@babylonjs/core";

//Interface for describing the interactable objects
export class Interactable {
    model;
    scene;

    constructor(scene){
        this.scene = scene;
    }
}