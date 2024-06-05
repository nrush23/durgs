import { SceneLoader, TransformNode, Vector3, PhysicsShapeBox, PhysicsBody, PhysicsMotionType, Quaternion } from "@babylonjs/core";
import { Food, cook_state} from "./food";

export class Patty extends Food{

    constructor(scene, position, name){
        super(scene);
        SceneLoader.ImportMesh("patty", "", "./assets/burger.glb", scene, (meshes) => {
            if (meshes.length > 0) {

                //Get .glb root and set it to unpickable
                const root = meshes[0];
                root.isPickable = false;
                root.enablePointerMoveEvents = false;

                //Create true parent node
                this.model = new TransformNode(name);
                root.parent = this.model;

                //Generate the Physics shape and body
                const {min, max} = this.model.getHierarchyBoundingVectors();
                const size = max.subtract(min);
                const center = min.add(max).scale(0.5);
                const shape = new PhysicsShapeBox(new Vector3(center.x, center.y, center.z), Quaternion.Identity(), size, scene);
                this.model.position = position;
                this.body = new PhysicsBody(this.model, PhysicsMotionType.DYNAMIC, false, scene);
                this.body.shape = shape;
                this.body.setMassProperties({mass: 1});

                //Set the metadata of the root and mesh to be this instance
                meshes[1].metadata = {classInstance: this};
                meshes[1].name = name;
                this.model.metadata = {classInstance: this};
                

                // this.model = meshes[0];
                // // console.log("patty:",this.model);
                // this.model.position = position;
                // this.model.isPickable = false;
                // this.model.enablePointerMoveEvents = false;
                // // this.model.name = "patty";
                // this.model.name = name;
                // this.model.metadata = { classInstance: this };
                // // console.log("patty:",meshes);
            }
        });
        this.doneness = cook_state.raw;
    }

    cook(){
        if(this.cook_time > 0.3){
            this.doneness = cook_state.perfect;
        }else if(this.cook_time > 0.6){
            this.doneness = cook_state.burnt;
        }
    }
}