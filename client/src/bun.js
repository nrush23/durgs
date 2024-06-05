import { TransformNode, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeType, Quaternion, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import { Food, cook_state } from "./food";

export class Bun extends Food {
    top;
    //Construct food items with their spawn position
    constructor(scene, top, position, name) {
        super(scene);
        this.top = top;
        let bun = (this.top) ? "top_bun" : "bottom_bun";
        SceneLoader.ImportMesh(bun, "", "./assets/burger.glb", scene, (meshes) => {
            //The model is the root of the bun mesh, so the action is associated with the parent
            //of the mesh, and not the mesh itself
            if (meshes.length > 0) {
                // meshes.forEach((mesh)=>{
                //     mesh.isPickable = false;
                //     mesh.enablePointerMoveEvents = false;
                // });
                const root = meshes[0];
                root.isPickable = false;
                root.enablePointerMoveEvents = false;
                this.model = new TransformNode(name);
                root.parent = this.model;
                const {min, max} = this.model.getHierarchyBoundingVectors();
                const size = max.subtract(min);
                const center = min.add(max).scale(0.5);
                const shape = new PhysicsShapeBox(new Vector3(center.x, center.y, center.z), Quaternion.Identity(), size, scene);
                this.model.position = position;
                this.body = new PhysicsBody(this.model, PhysicsMotionType.DYNAMIC, false, scene);
                this.body.shape = shape;
                this.body.setMassProperties({mass: 1});
                // meshes[1].isPickable = true;
                // meshes[1].enablePointerMoveEvents = true;
                meshes[1].metadata = {classInstance: this};
                meshes[1].name = name;
                this.model.metadata = {classInstance: this};
                // this.model.isPickable = true;
                // this.model.enablePointerMoveEvents = true;
                // this.model.metadata = { classInstance: this };
                // this.model = meshes[0];
                // this.model.position = position;
                // this.model.isPickable = false;
                // this.model.enablePointerMoveEvents = false;
                // this.model.name = name;
                // this.model.metadata = { classInstance: this };
                // new PhysicsAggregate(meshes[1], PhysicsShapeType.CYLINDER, {mass: 1}, scene);
                // console.log("bun:",meshes);
            }
        });
        this.doneness = cook_state.perfect;
    }

    cook() {
        this.doneness = (this.cook_time > 0.3)? cook_state.burnt : cook_state.perfect;
    }
}