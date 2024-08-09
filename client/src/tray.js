import { PhysicsBody, PhysicsMotionType, PhysicsShapeMesh, PhysicsViewer, SceneLoader } from "@babylonjs/core";
import { Interactable } from "./Interactable";

export class Tray extends Interactable {

    STACK;
    scene;
    model;
    body;
    constructor(scene) {
        super(scene);
        SceneLoader.ImportMesh("tray", "", "./assets/burger2.glb", scene, (meshes) => {
            this.model = meshes[0];
            this.model.metadata = { classInstance: this };
            this.model.name = "tray_root";
            this.model.isPickable = false;
            this.model.enablePointerMoveEvents = false;
            meshes[1].metadata = { classInstance: this };
            var shape = new PhysicsShapeMesh(meshes[1], scene);
            this.model.body = new PhysicsBody(this.model, PhysicsMotionType.DYNAMIC, false, scene);
            this.model.body.shape = shape;
            this.model.body.setMassProperties({ mass: 1 });
            this.body = this.model.body;
            var view = new PhysicsViewer(scene);
            view.showBody(this.model.body);
        });
    }

    offAction(player, right) {
        this.model.computeWorldMatrix(true);
        console.log("ABS: %s", this.model.getAbsolutePosition());
        player.SOCKET.send(JSON.stringify({
            timestamp: Date.now(),
            type: "release",
            PID: player.PID,
            item: this.model.name,
            arm: right,
            position: this.model.getAbsolutePosition(),
        }));
    }

    onAction(player, right) {
        player.SOCKET.send(JSON.stringify({
            timestamp: Date.now(),
            type: "grab",
            PID: player.PID,
            item: this.model.name,
            arm: right,
            position: this.model.getAbsolutePosition(),
        }));
    }

    addToStack(item) {

    }

}