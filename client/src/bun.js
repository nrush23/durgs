import { StandardMaterial, Color3, SubMesh, TransformNode, PhysicsViewer, MultiMaterial, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeType, Quaternion, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import { Food, cook_state } from "./food";

export class Bun extends Food {
    top;
    //Construct food items with their spawn position
    constructor(scene, top, position, name) {
        super(scene);
        this.top = top;
        let bun = (this.top) ? "top_bun" : "bottom_bun";
        SceneLoader.ImportMesh(bun, "", "./assets/burger.glb", scene, (meshes) => {
            if (meshes.length > 0) {
                this.createBody(meshes, position, name);
                // console.log(meshes);
                // //Get the root of the mesh and set it to be unpickable
                // const root = meshes[0];
                // root.isPickable = false;
                // root.enablePointerMoveEvents = false;

                // //Create the actual root transform node
                // this.model = new TransformNode(name);
                // root.parent = this.model;

                // //Generate the Physics shape and body
                // const { min, max } = this.model.getHierarchyBoundingVectors();
                // const size = max.subtract(min);
                // const center = min.add(max).scale(0.5);
                // const shape = new PhysicsShapeBox(new Vector3(center.x, center.y, center.z), Quaternion.Identity(), size, scene);
                // this.model.position = position;
                // this.body = new PhysicsBody(this.model, PhysicsMotionType.DYNAMIC, false, scene);
                // this.body.shape = shape;
                // this.body.setMassProperties({ mass: 1 });

                // //Set the metadata of the root and mesh to be this instance
                // meshes[1].metadata = { classInstance: this };
                // meshes[1].name = name;
                // this.model.metadata = { classInstance: this };

                // // Assuming meshes[1] is your mesh
                // var mesh = meshes[1];
                // var verticesCount = mesh.getTotalVertices();
                // var indicesCount = mesh.getTotalIndices()

                // // Clear existing subMeshes
                // mesh.subMeshes = [];

                // // Define subMeshes
                // new SubMesh(0, 0, verticesCount, 0, indicesCount, mesh);
                // new SubMesh(1, 0, verticesCount, 0, indicesCount, mesh);

                // // Create MultiMaterial
                // var NEW_MAT = new MultiMaterial("test_black", this.scene);
                // NEW_MAT.subMaterials.push(mesh.material); // Original material
                // NEW_MAT.subMaterials.push(this.OVERLAY); // Overlay material

                // // Apply MultiMaterial to the mesh
                // mesh.material = NEW_MAT;


                // var viewer = new PhysicsViewer(scene);
                // viewer.showBody(this.body);
            }
        });
        this.doneness = cook_state.perfect;
    }

    cook() {
        this.cook_time += .1;
        this.doneness = (this.cook_time > 0.3) ? cook_state.burnt : cook_state.perfect;
        this.OVERLAY.alpha = (this.cook_time < 1)? this.cook_time: 1;
    }
}