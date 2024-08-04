import { TransformNode, PhysicsShapeMesh, PhysicsMotionType, PhysicsBody } from "@babylonjs/core";
import { Interactable } from "./Interactable";
import { Vector3 } from "@babylonjs/core";
export class Restock_Icon extends Interactable {
    item;
    // scene;
    platform;
    constructor(scene, item, platform) {
        super(scene);
        // this.scene = scene;
        this.item = item;
        this.platform = platform;
    }

    setModel(model) {
        this.model = model;
        this.model.isPickable = true;
        this.model.enablePointerMoveEvents = true;
        this.model.metadata = { classInstance: this};
        let parent = new TransformNode("root_"+this.model.name, this.scene);
        parent.position = new Vector3(-1*this.model.position._x, this.model.position._y, this.model.position._z);
        this.model.position = new Vector3(0,0,0);
        this.model.parent = parent;
        this.model.parent.metadata = {classInstance: this};

        // //TESTING
        // const shape = new PhysicsShapeMesh(this.model, this.scene);
        // this.model.body = new PhysicsBody(this.model, PhysicsMotionType.DYNAMIC, false, this.scene);
        // this.model.body.shape = shape;
        // this.model.body.setMassProperties({mass:0});
        // this.model.body.setGravityFactor(0);
        // this.model.body.disablePreStep = false;
    }

    action(player, right) {
        player.SOCKET.send(JSON.stringify({
            timestamp: Date.now(),
            type: "spawn_request",
            item: this.item
        }));
        var arm = (right)? player.RIGHT_ARM:player.LEFT_ARM;
        arm.hit = null;
    }

    onAction(player, right){
        this.action(player);
    }

    offAction(player, right){
        this.action(player);
    }
}