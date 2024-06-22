import { PhysicsMotionType, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
//Class for controlling other players who join the world
export class Member {
    username;
    model = null;
    movement;
    scene;
    right_hand = "";
    grab = false;
    NEXT_POSITION;
    PREVIOUS_POSITION;

    constructor(username, scene, position, texture) {
        this.username = username;
        this.movement = new TransformNode(username, scene);
        this.movement.position = new Vector3(0, 0, 0);
        this.movement.position = position;
        this.NEXT_POSITION = new Vector3(0,0,0);
        this.PREVIOUS_POSITION = new Vector3(0,0,0);
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
        const delta = this.scene.getEngine().getDeltaTime() / 1000;
        const interpolationFactor = Math.min(1, delta * 60);
        Vector3.LerpToRef(this.movement.position, this.NEXT_POSITION, interpolationFactor, this.movement.position);
        if (this.right_hand) {
            this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
        }
    }

    updatePosition(position, rotation) {
        this.PREVIOUS_POSITION = this.NEXT_POSITION.clone();
        this.movement.position = this.PREVIOUS_POSITION.clone();
        this.NEXT_POSITION = new Vector3(position._x, position._y, position._z);
        this.movement.rotation = new Vector3(0, rotation._y, 0);
    }
    updatePosition2(position, rotation) {
        console.log(position);
        this.movement.position = new Vector3(position._x, position._y, position._z);
        if (this.right_hand) {
            // this.right_hand.parent.parent.position = this.movement.position;
            this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
        }
        this.movement.rotation = new Vector3(0, rotation._y, 0);
    }

    updateGrab(item) {
        if (item) {
            item.metadata.classInstance.body.disablePreStep = false;
            // item.metadata.classInstance.body.motionType = PhysicsMotionType.STATIC;
        }
        this.right_hand = item;
    }
}