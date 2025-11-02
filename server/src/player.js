import { Mesh, Scene, SceneLoader, TransformNode, Vector3, PhysicsShapeMesh, PhysicsMotionType, PhysicsBody } from "@babylonjs/core";

export default class Player {
    PID;
    // WID;
    username;
    position;
    // scene;
    socket;
    texture;
    model;
    node;
    scene;
    movement;
    previous_position;
    moved;
    NETWORK_CACHE;
    INPUT_BUFFER;
    MAX_SPEED;
    RIGHT_ARM = ""
    LEFT_ARM = ""
    right_hand = "";
    left_hand = "";
    ARM_ANGLE;
    camera;

    constructor() {
        this.PID = -1;
        this.username = null;
        this.socket = null;
        this.texture = null;
        this.position = new Vector3(0, 0, 0);
        this.right_hand = "";
        this.moved = "";
        this.NETWORK_CACHE = [];
        this.INPUT_BUFFER = [];
        this.MAX_SPEED = .5;
    }

    joinGame(scene) {
        this.scene = scene;
        SceneLoader.ImportMesh("body", "http://localhost:3001/assets/", "player2.glb", this.scene, (meshes) => {
            // console.log(meshes);
            if (meshes.length > 0) {
                this.model = meshes[0];
                this.model.name = this.username;
                this.movement = new TransformNode(this.PID, scene);
                this.movement.position = this.position;
                this.model.parent = this.movement;

                this.camera = new TransformNode(this.PID + "_camera", scene);
                this.camera.position = new Vector3(0, 0, 0);

                meshes[2].parent = this.camera;
                this.LEFT_ARM = meshes[2];
                this.LEFT_ARM.setEnabled(false);

                meshes[4].parent = this.camera;
                this.RIGHT_ARM = meshes[4];
                this.RIGHT_ARM.setEnabled(false);

                this.camera.position = this.movement.position;
                console.log("%s entered the scene", this.username);
            }
        })
    }

    setModel(mesh) {
        this.model = mesh;
    }

    render2(input) {
        let CURRENT = input[4];
        let TWIST = input[3];
        let ROTATION = input[2];
        let VERTICAL = input[0];
        let HORIZONTAL = input[1];
        // console.log("CURRENT: %s, TWIST: %s, ROTATION: %s, VERT: %s, HORZ: %s", CURRENT, TWIST, ROTATION, VERTICAL, HORIZONTAL);

        let forward = new Vector3(ROTATION._x * this.MAX_SPEED, ROTATION._y * this.MAX_SPEED, ROTATION._z * this.MAX_SPEED);
        let backward = forward.scale(-1);
        let left = new Vector3(-ROTATION._z * this.MAX_SPEED, ROTATION._y * this.MAX_SPEED, ROTATION._x * this.MAX_SPEED);
        let right = left.scale(-1);

        if (VERTICAL == "UP") {
            this.movement.position.addInPlace(forward);
        } else if (VERTICAL == "DOWN") {
            this.movement.position.addInPlace(backward);
        }

        if (HORIZONTAL == "LEFT") {
            this.movement.position.addInPlace(left);
        } else if (HORIZONTAL == "RIGHT") {
            this.movement.position.addInPlace(right);
        }
        this.movement.rotation = new Vector3(0, TWIST._y, 0);
        this.camera.rotation = new Vector3(TWIST._x, TWIST._y, TWIST._z);
    }

    /*Add new input messages to the buffer for processing on next
    world update */
    addInput(vertical, horizontal, rotation, twist, index) {
        this.INPUT_BUFFER.push([vertical, horizontal, rotation, twist, index]);
    }

    extendArm(right) {
        if (right) {
            this.RIGHT_ARM.setEnabled(true);
        } else {
            this.LEFT_ARM.setEnabled(true);
        }
    }

    retractArm(right) {
        if (right) {
            this.RIGHT_ARM.setEnabled(false);
        } else {
            this.LEFT_ARM.setEnabled(false);
        }
    }

    addGrab(item, right) {

        var mesh = this.scene.getMeshByName(item);
        if (mesh) {
            mesh.metadata.classInstance.body.disablePreStep = false;
            mesh.metadata.classInstance.body.setMotionType(PhysicsMotionType.STATIC);
            mesh.metadata.classInstance.body.transformNode.position = (right) ? this.RIGHT_ARM.position.clone() : this.LEFT_ARM.position.clone();
            mesh.metadata.classInstance.body.transformNode.position.z += 1;
            mesh.metadata.classInstance.body.transformNode.rotationa = Vector3.Zero();
            mesh.metadata.classInstance.body.transformNode.parent = this.camera;
            if (right) {
                this.right_hand = mesh;
            } else {
                this.left_hand = mesh;
            }
            console.log("grabbed %s: %s", mesh.name, (right) ? this.RIGHT_ARM.getAbsolutePosition() : this.LEFT_ARM.getAbsolutePosition());
        }
    }

    removeGrab(right, position) {
        console.log("Movement: %s Cam: %s", this.movement.position, this.camera.position);
        console.log("Cam Rot: %s", this.camera.rotation);
        var mesh = (right) ? this.right_hand : this.left_hand;
        if (mesh) {
            mesh.metadata.classInstance.body.disablePreStep = true;
            mesh.metadata.classInstance.body.setMotionType(PhysicsMotionType.DYNAMIC);
            mesh.metadata.classInstance.body.transformNode.parent = "";
            console.log("%s: %s", mesh.name, mesh.metadata.classInstance.model.getAbsolutePosition());
            setTimeout(() => { console.log("Released %s: %s (%s)", mesh.name, mesh.position, mesh.metadata.classInstance.model.getAbsolutePosition()) }, 2000);
            if (right) {
                this.right_hand = "";
            } else {
                this.left_hand = "";
            }
            this.retractArm(right);
        }
    }
}