import { Food, cook_state } from "./food";
import { SceneLoader, MultiMaterial, SubMesh, TransformNode, Vector3, PhysicsShapeBox, PhysicsBody, PhysicsMotionType, Quaternion } from "@babylonjs/core";
export class Tomato extends Food {
    constructor(scene, position, name) {
        super(scene);
        SceneLoader.ImportMesh("tomato", "", "./assets/burger2.glb", scene, (meshes) => {
            if (meshes.length > 0) {
                this.createBody(meshes, position, name);
            }
        });
        this.doneness = cook_state.perfect;
        this.joint_distance = 0.015;
    }

    cook() {
        this.cook_time += .1;
        if (this.cook_time > 0.5) {
            this.doneness = cook_state.burnt;
        }
        this.OVERLAY.alpha = this.cook_time;
    }
}