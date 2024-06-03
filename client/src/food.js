import { AbstractMesh, Mesh, Scene } from '@babylonjs/core';
import { Interactable } from './Interactable';
export const cook_state = { raw: 'RAW', perfect: 'PERFECT', burnt: 'BURNT' };
export class Food extends Interactable {
    model;
    scene;
    //We will overlay a color darkener based on the cook state
    doneness;
    cook_time;
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.cook_time = 0;
    }

    action(player) {
        // this.grab(input);
        // console.log(player);
        if (player.grab && !player.right_hand) {
            player.SOCKET.send(JSON.stringify({
                timestamp: Date.now(),
                type: "grab",
                PID: player.PID,
                item: this.model.name,
            }));
        }else if (!player.grab && player.right_hand){
            player.SOCKET.send(JSON.stringify({
                timestamp: Date.now(),
                type: "release",
                PID: player.PID,
                item: this.model.name,
            }));
        }
    }

    cook() {

    }
    
}