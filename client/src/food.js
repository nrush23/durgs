import { PhysicsViewer, Vector3, TransformNode, MultiMaterial, SubMesh, PhysicsShapeBox, Quaternion, PhysicsBody, PhysicsMotionType, StandardMaterial, Color3, PhysicsShapeMesh, PhysicsEventType, PhysicsJoint, Axis, DistanceJoint, DistanceConstraint } from '@babylonjs/core';
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

        //Generate the Physics shape and body
        const { min, max } = this.model.getHierarchyBoundingVectors();
        const size = max.subtract(min);
        const center = min.add(max).scale(0.5);
        const shape = new PhysicsShapeBox(new Vector3(center.x, center.y, center.z), Quaternion.Identity(), size, this.scene);
        this.model.position = position;
        this.body = new PhysicsBody(this.model, PhysicsMotionType.DYNAMIC, false, this.scene);
        this.body.shape = shape;
        this.body.setMassProperties({ mass: 0.5 });
        this.body.setCollisionCallbackEnabled(true);
        this.body.getCollisionObservable().add((collision) => {
            // console.log("collision detected");
            // console.log(!this.top);
            // if (collision.type === PhysicsEventType.COLLISION_STARTED) {
            //     console.log("%s %s %s %s %s %s %s", collision.type === PhysicsEventType.COLLISION_STARTED, this.top_stack == null, collision.collidedAgainst.transformNode?.metadata, (collision.collidedAgainst.transformNode?.metadata) ? 'classInstance' in collision.collidedAgainst.transformNode.metadata : false, collision.collidedAgainst.transformNode.metadata.classInstance.body.motionType == PhysicsMotionType.DYNAMIC, collision.collidedAgainst.transformNode.metadata.classInstance.bottom == null, collision.collidedAgainst.transformNode.metadata.classInstance.model.position.y > this.model.y);
            // }

            // if (collision.type === PhysicsEventType.COLLISION_STARTED && this.top_stack == null && collision.collidedAgainst.transformNode?.metadata?.classInstance?.body?.motionType == PhysicsMotionType.DYNAMIC) {
            //     mesh.metadata.classInstance.body.disablePreStep = false;
            //     mesh.metadata.classInstance.body.setMotionType(PhysicsMotionType.STATIC);
            //     mesh.metadata.classInstance.model.position = new Vector3(0, size.y, 0);
            //     // console.log("size: %s", size);
            //     console.log("bottom: %s", mesh.metadata.classInstance.bottom);
            //     mesh.metadata.classInstance.model.rotation = new Vector3(0, 0, 0);
            //     mesh.metadata.classInstance.model.parent = this.model;
            //     this.top_stack = collision.collidedAgainst.transformNode;
            // }


            //OLD CODE THAT KINDA DID STUFF
            // if (collision.type === PhysicsEventType.COLLISION_STARTED && this.top_stack == null && collision.collidedAgainst.transformNode?.metadata && 'classInstance' in collision.collidedAgainst.transformNode.metadata && collision.collidedAgainst.transformNode.metadata.classInstance.bottom == null && collision.collidedAgainst.transformNode.metadata.classInstance.model.position.y > this.model.position.y) {
            //     console.log("%s %s %s", this.model.name, collision.collidedAgainst.transformNode.name, collision.collidedAgainst.transformNode.metadata.classInstance.body.motionType);
            //     var mesh = collision.collidedAgainst.transformNode;
            //     mesh.metadata.classInstance.body.disablePreStep = false;
            //     mesh.metadata.classInstance.body.setMotionType(PhysicsMotionType.STATIC);
            //     mesh.metadata.classInstance.model.position = new Vector3(0, size.y, 0);
            //     // console.log("size: %s", size);
            //     console.log("bottom: %s", mesh.metadata.classInstance.bottom);
            //     mesh.metadata.classInstance.model.rotation = new Vector3(0, 0, 0);
            //     mesh.metadata.classInstance.model.parent = this.model;
            //     mesh.metadata.classInstance.bottom = this;
            //     this.top_stack = mesh;
            // }else if( collision.type == PhysicsEventType.COLLISION_STARTED && this.top_stack?.metadata.classInstance.top_stack == null){
            //     console.log("no collision: %s %s %s %s", this.model.name, (this.top_stack)?this.top_stack.name:this.top_stack,collision.collidedAgainst.transformNode.name, (collision.collidedAgainst.transformNode?.metadata?.classInstance?.bottom)? collision.collidedAgainst.transformNode.metadata.classInstance.bottom.model.name:"empty");
            // }


            //NEW CODE


            //This works for one item falling on top of another and being picked up again

            //Also works for multiple stacks but not for preventing multiple objects to be placed
            //in the same spot

            //Think this stops working for already stacked because of the against.model.position = new Vector3(0, size.y, 0)
            //Probably fix this with creating hidden snap points
            // var against = collision.collidedAgainst.transformNode;
            // if(collision.type === PhysicsEventType.COLLISION_STARTED && against?.metadata?.classInstance && against.metadata.classInstance.bottom == null && against.metadata.classInstance.model.getAbsolutePosition().y + size.y> this.model.getAbsolutePosition().y){
            //     console.log(against);
            //     against = against.metadata.classInstance;
            //     against.body.disablePreStep = false;
            //     against.body.setMotionType(PhysicsMotionType.STATIC);
            //     against.model.position = new Vector3(0,size.y, 0);
            //     against.model.rotation = Vector3.Zero();
            //     against.model.parent = this.model;
            //     against.bottom = this;

            // }else if(collision.type == PhysicsEventType.COLLISION_STARTED && against?.metadata?.classInstance?.bottom){
            //     console.log("top(%s): %s, bottom(%s): %s, %s", against.name, against.metadata.classInstance.model.position.y, this.model.name, this.model.position.y, against.metadata.classInstance.model.position.y > this.model.position.y);
            //     console.log("top: %s, bottom: %s, %s", against.metadata.classInstance.model.getAbsolutePosition().y + size.y, this.model.getAbsolutePosition().y, against.metadata.classInstance.model.getAbsolutePosition().y > this.model.getAbsolutePosition().y);
            // }else if (collision.type == PhysicsEventType.COLLISION_STARTED && against?.metadata?.classInstance){
            //     console.log("%s", against.name);
            // }

            //Now trying new approach
            //Same thing from, but from the top's POV
            var under = collision.collidedAgainst.transformNode;
            if (collision.type === PhysicsEventType.COLLISION_STARTED && under?.metadata?.classInstance && this.top_stack != under && under.metadata.classInstance.top_stack == null && under.getAbsolutePosition().y < this.model.getAbsolutePosition().y) {
                
                console.log("joint started %s %s %s", this.model.name, under.name);
                this.body.disablePreStep = false;
                this.body.setMotionType(PhysicsMotionType.STATIC);
                this.model.position = new Vector3(0, size.y, 0);
                this.model.rotation = Vector3.Zero();
                this.model.parent = under;
                this.bottom = under;
                under.metadata.classInstance.top_stack = this.model;
                under.metadata.classInstance.body.disablePreStep = false;
                under.metadata.classInstance.body.setMotionType(PhysicsMotionType.STATIC);
                console.log("joint code finished, bottom: %s top: %s", under.name, this.model.name);

            } //else if (under?.metadata?.classInstance) {
                // console.log("%s: %s %s", under.name, under.metadata.classInstance.bottom, under.metadata.classInstance.top_stack);
                // console.log("top(%s): %s bottom(%s): %s", this.model.name, this.model.position, against.name, against.position);
            // }
        });

        // var joint = new DistanceJoint({maxDistance: 0, mainAxis: Axis.Y});
        // var joint = new DistanceConstraint(size.y, this.scene);
        // this.body.addConstraint(against.metadata.classInstance.body, joint);
        // against.metadata.classInstance.body.addConstraint(this.body, joint);
        // against.metadata.classInstance.top_stack = this;

        // this.body.getCollisionEndedObservable().add((collision) => {
        //     if (this.top_stack == collision.collidedAgainst.transformNode) {
        //         console.log("ENDED %s", collision.collidedAgainst.transformNode.name);
        //         this.top_stack = null;
        //     }
        // });

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


        var viewer = new PhysicsViewer(this.scene);
        viewer.showBody(this.body);
    }

}