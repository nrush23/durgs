import { Interactable } from "./Interactable";

export class Restock_Icon extends Interactable {
    item;
    // scene;
    platform;
    constructor(scene, item, platform){
        super(scene);
        // this.scene = scene;
        this.item = item;
        this.platform = platform;
    }

    setModel(model){
        this.model = model;
        console.log(model);
        this.model.isPickable = true;
        this.model.enablePointerMoveEvents = true;
    }
    
    action(item){

    }
}