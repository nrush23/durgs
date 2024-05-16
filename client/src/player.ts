import { Mesh, Vector3, double, int } from "@babylonjs/core";

export class Player{
    UID: int;
    username: String;
    model: Mesh;
    position: Vector3;

    constructor(){
        this.UID = -1;
        this.username = "null";
    }

    setModel(mesh: Mesh){
        this.model = mesh;
    }

    updatePosition(pos: Vector3){
        this.position = pos;
    }
}