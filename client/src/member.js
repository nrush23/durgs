import { PhysicsMotionType, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
//Class for controlling other players who join the world
export class Member {
    username;
    model = null;
    movement;
    scene;
    right_hand = "";
    grab = false;

    constructor(username, scene, position, texture) {
        this.username = username;
        this.movement = new TransformNode(username, scene);
        this.movement.position = new Vector3(0, 0, 0);
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
                meshes.forEach(mesh => {
                    mesh.isPickable = false;
                    mesh.enablePointerMoveEvents = false;
                });
                console.log(this.model);
            }
        });

        // scene.registerBeforeRender(()=>{
        //     if(this.right_hand){
        //         this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
        //     }
        // });

    }

    render() {
        if (this.right_hand) {
            this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
        }
    }

    updatePosition(position, rotation) {
        console.log(position);
        this.movement.position = new Vector3(position._x, position._y, position._z);
        if (this.right_hand) {
            // this.right_hand.parent.parent.position = this.movement.position;
            this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
        }
        this.movement.rotation = new Vector3(rotation._x, rotation._y, rotation._z);
    }

    updateGrab(item) {
        if (item) {
            item.metadata.classInstance.body.disablePreStep = false;
            // item.metadata.classInstance.body.motionType = PhysicsMotionType.STATIC;
        }
        this.right_hand = item;
    }
}