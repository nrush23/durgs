import { AbstractMesh, Mesh, Scene, StandardMaterial, Color3 } from '@babylonjs/core';
import { Interactable } from './Interactable';
export const cook_state = { raw: 'RAW', perfect: 'PERFECT', burnt: 'BURNT' };
export class Food extends Interactable {
    model;
    scene;
    //We will overlay a color darkener based on the cook state
    doneness;
    cook_time;
    body;
    OVERLAY;
    MATERIAL;
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.cook_time = 0;
        this.OVERLAY = new StandardMaterial("black", scene);
        this.OVERLAY.diffuseColor = new Color3(0,0,0);
        this.OVERLAY.alpha = 0;
    }

    onAction(player, right) {

        player.SOCKET.send(JSON.stringify({
            timestamp: Date.now(),
            type: "grab",
            PID: player.PID,
            item: this.model.name,
            arm: right,
        }));
        // // this.grab(input);
        // // console.log(player);
        // if (player.grab && !player.right_hand) {
        //     player.SOCKET.send(JSON.stringify({
        //         timestamp: Date.now(),
        //         type: "grab",
        //         PID: player.PID,
        //         item: this.model.name,
        //     }));
        // }else if (!player.grab && player.right_hand){
        //     player.SOCKET.send(JSON.stringify({
        //         timestamp: Date.now(),
        //         type: "release",
        //         PID: player.PID,
        //         item: this.model.name,
        //     }));
        // }
    }

    offAction(player, right) {
        player.SOCKET.send(JSON.stringify({
            timestamp: Date.now(),
            type: "release",
            PID: player.PID,
            item: this.model.name,
            arm: right,
        }));
    }

    cook() {

    }

}