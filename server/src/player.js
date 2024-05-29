import { Mesh, Scene, Vector3 } from "@babylonjs/core";

export default class Player{
    PID;
    // WID;
    username;
    position;
    // scene;
    socket;
    texture;
    right_hand;

    constructor(){
        this.PID = -1;
        this.username = null;
        // this.WID = -1;
        this.socket = null;
        this.texture = null;
        this.position = new Vector3(0,0,0);
        this.right_hand = "";
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