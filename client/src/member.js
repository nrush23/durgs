import { SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
//Class for controlling other players who join the world
export class Member {
    username;
    model = null;
    movement;
    scene;
    right_hand = "";
    grab = false;

    constructor(username, scene, position, texture){
        this.username = username;
        this.movement = new TransformNode(username, scene);
        this.movement.position = position;
        this.scene = scene;
        SceneLoader.ImportMesh("body", "", "./assets/player.glb", this.scene, (meshes) => {
            if (meshes.length > 0) {
                console.log(meshes);

                this.model = meshes[0];
                // this.model.isPickable = false;
                // this.model.enablePointerMoveEvents = false;

                // this.model = this.model.parent;
                this.model.name = "member";
                this.model.parent = this.movement;
                meshes.forEach(mesh =>{
                    mesh.isPickable = false;
                    mesh.enablePointerMoveEvents = false;
                });
                console.log(this.model);
            }
        });
    }

    updatePosition(position){
        this.movement.position = position;
    }

    updateGrab(item){
        this.right_hand = item;
    }
}