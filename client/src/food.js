import { PhysicsViewer, Vector3, TransformNode, MultiMaterial, SubMesh, PhysicsShapeBox, Quaternion, PhysicsBody, PhysicsMotionType, StandardMaterial, Color3, PhysicsShapeMesh, PhysicsEventType, PhysicsJoint, Axis, DistanceJoint, DistanceConstraint, AnaglyphGamepadCamera } from '@babylonjs/core';
import { Interactable } from './Interactable';
export const cook_state = { raw: 'RAW', perfect: 'PERFECT', burnt: 'BURNT' };
export class Food extends Interactable {
    model;
    scene;
    //We will overlay a color darkener based on the cook state
    doneness;
    cook_time;
    body;
    OVERLAY;
    MATERIAL;
    bottom = null;
    top_stack = null;
    joint_distance = null;
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.cook_time = 0;
        this.OVERLAY = new StandardMaterial("black", scene);
        this.OVERLAY.diffuseColor = new Color3(0, 0, 0);
        this.OVERLAY.alpha = 0;
    }

    onAction(player, right) {

        player.SOCKET.send(JSON.stringify({
            timestamp: Date.now(),
            type: "grab",
            PID: player.PID,
            item: this.model.name,
            arm: right,
            position: this.model.getAbsolutePosition(),
        }));

    }

    offAction(player, right) {
        this.model.computeWorldMatrix(true);
        console.log("ABS: %s", this.model.getAbsolutePosition());
        player.SOCKET.send(JSON.stringify({
            timestamp: Date.now(),
            type: "release",
            PID: player.PID,
            item: this.model.name,
            arm: right,
            position: this.model.getAbsolutePosition(),
        }));
    }

    cook() {

    }

    // createBody(mesh){
    //     const { min, max } = mesh.getHierarchyBoundingVectors();
    //     const size = max.subtract(min);
    //     const center = min.add(max).scale(0.5);
    //     const shape = new PhysicsShapeBox(new Vector3(center.x, center.y, center.z), Quaternion.Identity(), size, this.scene);
    //     mesh.body = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, this.scene);
    //     mesh.body.shape = shape;
    //     mesh.body.setMassProperties({ mass: 1 });
    // }

    undoStack() {
        if (!this.bottom) {
            this.body.setMotionType(PhysicsMotionType.DYNAMIC);
        } else {
            this.bottom.metadata.classInstance.top_stack = null;
            this.bottom = null;
        }
    }

    breakLink() {
        if (this.bottom) {
            var bottom = this.bottom.metadata.classInstance;
            bottom.top_stack = null;
            if (bottom.bottom == null) {
                bottom.body.setMotionType(PhysicsMotionType.DYNAMIC);
            }
            this.bottom = null;
            console.log("break link top_stack: %s", this.top_stack?.name);
        }
    }

    createBody(meshes, position, name) {

        console.log(meshes);
        //Get the root of the mesh and set it to be unpickable
        const root = meshes[0];
        root.isPickable = false;
        root.enablePointerMoveEvents = false;

        //Create the actual root transform node
        this.model = new TransformNode(name);
        root.parent = this.model;
        // root.name = name + "_model";

        //TESTING

        //Generate the Physics shape and body
        const { min, max } = this.model.getHierarchyBoundingVectors();
        const size = max.subtract(min);
        const center = min.add(max).scale(0.5);

        var box = meshes[1].getBoundingInfo().boundingBox;
        // meshes[1].showBoundingBox = true;
        if (box.extendSize.y < 0.05) {
            box.extendSize.y = 0.02;
        }
        const shape = new PhysicsShapeBox(box.centerWorld, Quaternion.Identity(), box.extendSize.scale(2), this.scene);
        this.model.position = position;
        this.body = new PhysicsBody(this.model, PhysicsMotionType.DYNAMIC, false, this.scene);
        this.body.shape = shape;
        this.body.setMassProperties({ mass: 1 });
        this.body.setCollisionCallbackEnabled(true);
        this.joint_distance = box.extendSize.y;
        this.body.getCollisionObservable().add((collision) => {
            //Now trying new approach
            //Same thing from, but from the top's POV
            var under = collision.collidedAgainst.transformNode;
            if (collision.type === PhysicsEventType.COLLISION_STARTED && under?.metadata?.classInstance && this.top_stack != under && under.metadata.classInstance.top_stack == null && under.getAbsolutePosition().y < this.model.getAbsolutePosition().y) {

                console.log("joint started %s %s %s", this.model.name, under.name);
                this.body.disablePreStep = false;
                this.body.setMotionType(PhysicsMotionType.STATIC);
                this.model.position = new Vector3(0, this.joint_distance + under.metadata.classInstance.joint_distance, 0);
                console.log("%s and %s distance: %s", this.model.name, under.name, this.model.position.y);
                this.model.rotation = Vector3.Zero();
                this.model.parent = under;
                this.bottom = under;
                under.metadata.classInstance.top_stack = this.model;
                under.metadata.classInstance.body.disablePreStep = false;
                under.metadata.classInstance.body.setMotionType(PhysicsMotionType.STATIC);
                console.log("joint code finished, bottom: %s top: %s", under.name, this.model.name);

            }
        });

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


        // var viewer = new PhysicsViewer(this.scene);
        // viewer.showBody(this.body);
    }

    setEnabled(enable) {
        if (enable) {
            this.body.setMotionType(PhysicsMotionType.DYNAMIC);
        } else {
            this.body.disablePreStep = false;
            this.body.setMotionType(PhysicsMotionType.STATIC);
        }
    }

}