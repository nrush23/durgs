import { PhysicsViewer, Vector3, TransformNode, MultiMaterial, SubMesh, PhysicsShapeBox, Quaternion, PhysicsBody, PhysicsMotionType, StandardMaterial, Color3, PhysicsShapeMesh, PhysicsEventType, PhysicsJoint, Axis, DistanceJoint, DistanceConstraint, AnaglyphGamepadCamera, PhysicsShapeCylinder } from '@babylonjs/core';
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
    joint_distance = 0.0000;
    box;
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
                bottom.body.disablePreStep = true;
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
        this.model.position = position;

        //TESTING
        var bound = meshes[1].getBoundingInfo().boundingBox.extendSize;
        var height = bound.y * 2;
        var radius = bound.x;

        const shape = new PhysicsShapeCylinder(new Vector3(0, -bound.y, 0), new Vector3(0, bound.y, 0), radius, this.scene);
        this.body = new PhysicsBody(this.model, PhysicsMotionType.STATIC, false, this.scene);
        this.body.shape = shape;
        this.body.setMassProperties({ mass: 0.5 });
        this.body.centerOfMass = new Vector3(0, 0, 0);
        this.body.rotationQuaternion = meshes[1].rotationQuaternion.clone();
        this.body.scaling = meshes[1].scaling;
        this.body.setCollisionCallbackEnabled(true);
        this.joint_distance = height / 2;
        console.log("%s %s", this.model.name, this.joint_distance);

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
        this.box = meshes[1].getBoundingInfo().boundingBox;

        // var viewer = new PhysicsViewer(this.scene);
        // viewer.showBody(this.body);
    }

    addCollision() {
        this.body.getCollisionObservable().add((collision) => {
            this.collide(collision);
        });
        this.valid = true;
        console.log("%s added collision", this.model.name);
    }

    //Need to check they are not in the same stack
    collide(collision) {
        var against = collision.collidedAgainst.transformNode;
        if (collision.type === PhysicsEventType.COLLISION_STARTED && against.metadata?.classInstance && against.metadata.classInstance.top_stack == null && against.getAbsolutePosition().y < this.model.getAbsolutePosition().y + this.joint_distance && !against.metadata.classInstance.checkParent(this.model.name)) {
            console.log("%s %s", this.model.name, against.name);
            this.setEnabled(false);
            var height = this.joint_distance + against.metadata.classInstance.joint_distance;
            console.log("this joint: %s against joint: %s height: %s", this.joint_distance, against.metadata.classInstance.joint_distance, height);
            height = +height.toFixed(4);
            console.log("this joint: %s against joint: %s height: %s", this.joint_distance, against.metadata.classInstance.joint_distance, height);
            this.model.position = new Vector3(0, height + 0.005, 0);
            this.model.rotation = Vector3.Zero();
            this.model.parent = against;
            against.metadata.classInstance.top_stack = this;
            against.metadata.classInstance.setEnabled(false);
            this.bottom = against;
        }
    }

    setEnabled(enable) {
        if (enable) {
            this.body.setMotionType(PhysicsMotionType.DYNAMIC);
            this.body.disablePreStep = true;
            console.log("%s %s", this.model.name, this.body.getMotionType());
        } else {
            this.body.disablePreStep = false;
            this.body.setMotionType(PhysicsMotionType.STATIC);
            console.log("%s %s", this.model.name, this.body.getMotionType());
        }
    }

    checkParent(name) {
        if (this.model.parent && name == this.model.parent.name) {
            return true;
        } else if (this.model.parent) {
            return this.model.parent.metadata.classInstance.checkParent(name);
        }
        return false;
    }

}