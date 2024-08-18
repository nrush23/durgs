import { PhysicsBody, PhysicsMotionType, PhysicsShapeMesh, PhysicsViewer, SceneLoader, TransformNode } from "@babylonjs/core";
import { Interactable } from "./Interactable";

export class Tray extends Interactable {

    STACK;
    scene;
    model;
    body;
    top_stack = null;
    bottom = null;
    joint_distance;
    constructor(scene) {
        super(scene);
        SceneLoader.ImportMesh("tray", "", "./assets/burger2.glb", scene, (meshes) => {
            this.model = new TransformNode("tray", scene);
            meshes[0].parent = this.model;
            this.model.metadata = { classInstance: this };
            meshes[0].name = "tray_root";
            this.model.isPickable = false;
            this.model.enablePointerMoveEvents = false;
            meshes[1].metadata = { classInstance: this };
            var shape = new PhysicsShapeMesh(meshes[1], scene);
            this.body = new PhysicsBody(this.model, PhysicsMotionType.DYNAMIC, false, scene);
            this.body.shape = shape;
            this.body.setMassProperties({ mass: 1 });
            // this.body = this.model.body;


            this.joint_distance = meshes[1].getBoundingInfo().boundingBox.extendSize.y;
            console.log("tray joint_distance: %s", this.joint_distance);

            // var view = new PhysicsViewer(scene);
            // view.showBody(this.body);
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

    setEnabled(enable) {
        if (enable) {
            this.body.setMotionType(PhysicsMotionType.DYNAMIC);
        } else {
            this.body.disablePreStep = false;
            this.body.setMotionType(PhysicsMotionType.STATIC);
        }
    }

}