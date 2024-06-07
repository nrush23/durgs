import { TransformNode, Vector3 } from "@babylonjs/core";
import { Interactable } from "./Interactable.js";
export class Restock_Icon extends Interactable {
    item;
    platform;
    constructor(scene, item, platform) {
        super(scene);
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
    }
}