import { Mesh, Scene, Vector3 } from "@babylonjs/core";

export default class Player{
    PID;
    WID;
    username;
    model;
    position;
    scene;

    constructor(){
        this.PID = -1;
        this.username = "null";
        this.WID = -1;
    }

    joinGame(scene){

    }

    setModel(mesh){
        this.model = mesh;
    }

    updatePosition(pos){
        this.position = pos;
    }
}