import { Food, cook_state } from "./food";
import { SceneLoader, MultiMaterial, SubMesh, TransformNode, Vector3, PhysicsShapeBox, PhysicsBody, PhysicsMotionType, Quaternion } from "@babylonjs/core";
export class Tomato extends Food {
    constructor(scene, position, name) {
        super(scene);
        SceneLoader.ImportMesh("tomato", "", "./assets/burger2.glb", scene, (meshes) => {
            if (meshes.length > 0) {


                //Get .glb root and set it to unpickable
                const root = meshes[0];
                root.isPickable = false;
                root.enablePointerMoveEvents = false;

                //Create true parent node
                this.model = new TransformNode(name);
                root.parent = this.model;

                //Generate the Physics shape and body
                const { min, max } = this.model.getHierarchyBoundingVectors();
                const size = max.subtract(min);
                const center = min.add(max).scale(0.5);
                const shape = new PhysicsShapeBox(new Vector3(center.x, center.y, center.z), Quaternion.Identity(), size, scene);
                this.model.position = position;
                this.body = new PhysicsBody(this.model, PhysicsMotionType.DYNAMIC, false, scene);
                this.body.shape = shape;
                this.body.setMassProperties({ mass: 0.5 });

                //Set the metadata of the root and mesh to be this instance
                meshes[1].metadata = { classInstance: this };
                meshes[1].name = name;
                this.model.metadata = { classInstance: this };

                // Assuming meshes[1] is your mesh
                var mesh = meshes[1];
                var verticesCount = mesh.getTotalVertices();
                var indicesCount = mesh.getTotalIndices()

                // Clear existing subMeshes
                mesh.subMeshes = [];

                // Define subMeshes
                new SubMesh(0, 0, verticesCount, 0, indicesCount, mesh);
                new SubMesh(1, 0, verticesCount, 0, indicesCount, mesh);

                // Create MultiMaterial
                var NEW_MAT = new MultiMaterial("test_black", this.scene);
                NEW_MAT.subMaterials.push(mesh.material); // Original material
                NEW_MAT.subMaterials.push(this.OVERLAY); // Overlay material

                // Apply MultiMaterial to the mesh
                mesh.material = NEW_MAT;
            }
        });
        this.doneness = cook_state.perfect;
    }

    cook() {
        this.cook_time += .1;
        if (this.cook_time > 0.5) {
            this.doneness = cook_state.burnt;
        }
        this.OVERLAY.alpha = this.cook_time;
    }
}