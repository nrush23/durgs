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
    right_hand="";
    left_hand="";
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
                this.movement = new TransformNode(this.PID, this.scene);
                this.movement.position = new Vector3(0, 0, 0);
                this.model.parent = this.movement;
                this.camera = new TransformNode(this.PID + "_camera", this.scene);
                this.camera.position = new Vector3(0,0,0);
                this.camera.rotation = new Vector3(0,0,0);

                //TESTING, ADDING ARMS

                // let position = new Vector3(0.4, -0.20, 1.20);

                this.LEFT_ARM = meshes[2];
                this.LEFT_ARM.parent = null;
                // this.LEFT_ARM.position = position.clone();
                // this.LEFT_ARM.position.x -= 0.8;
                this.LEFT_ARM.parent = this.camera;

                this.createArm(false);
                this.LEFT_ARM.setEnabled(false);

                this.RIGHT_ARM = meshes[4];
                this.RIGHT_ARM.parent = null;
                // this.RIGHT_ARM.position = position;
                this.RIGHT_ARM.parent = this.camera;
                
                this.createArm(true);
                this.RIGHT_ARM.setEnabled(false);
                //END TESTING
                console.log("%s entered the scene", this.username);
            }
        })
    }

    createArm(right) {
        // var arm = (right) ? this.RIGHT_ARM : this.LEFT_ARM;
        // const shape = new PhysicsShapeMesh(arm, this.scene);
        // arm.body = new PhysicsBody(arm, PhysicsMotionType.STATIC, false, this.scene);
        // arm.body.shape = shape;
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

        // let forward = new Vector3(ROTATION._x * this.MAX_SPEED, 0, ROTATION._z * this.MAX_SPEED);
        // let backward = forward.scale(-1);
        // let left = new Vector3(-ROTATION._z * this.MAX_SPEED, 0, ROTATION._x * this.MAX_SPEED);
        // let right = left.scale(-1);

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
        this.camera.position.copyFrom(this.movement.position);
        this.camera.rotation = new Vector3(ROTATION._x, ROTATION._y, ROTATION._z);
    }

    /*Add new input messages to the buffer for processing on next
    world update */
    addInput(vertical, horizontal, rotation, twist, index) {
        this.INPUT_BUFFER.push([vertical, horizontal, rotation, twist, index]);
    }

    extendArm(right){
        if(right){
            this.RIGHT_ARM.setEnabled(true);
        }else{
            this.LEFT_ARM.setEnabled(true);
        }
    }

    retractArm(right){
        if(right){
            this.RIGHT_ARM.setEnabled(false);
            // if(this.right_hand){
                // this.removeGrab(true);
            // }
        }else{
            this.LEFT_ARM.setEnabled(false);
            // if(this.left_hand){
            //     this.removeGrab(false);
            // }
        }
    }

    addGrab(item, right){
        //Retrieve the mesh and disable its physics updates
        var mesh = this.scene.getMeshByName(item);
        mesh.metadata.classInstance.body.disablePreStep = false;
        mesh.metadata.classInstance.body.setMotionType(PhysicsMotionType.STATIC);

        var arm = (right)? this.RIGHT_ARM:this.LEFT_ARM;
        //Make sure RIGHT_ARM's position is up to date
        // this.RIGHT_ARM.computeWorldMatrix(true);
        // arm.computeWorldMatrix(true);

        //Copy the RIGHT_ARM's position, push it a little bit forward, reset the rotation,
        //and parent to the camera
        // let position = this.RIGHT_ARM.position.clone();
        let position = arm.position.clone();
        // console.log("%s vs %s", this.camera.position, this.RIGHT_ARM.position);
        console.log("%s vs %s", this.camera.position, arm.position);
        position.z += 1;
        mesh.metadata.classInstance.model.position = position;
        mesh.metadata.classInstance.model.rotation = new Vector3(0, 0, 0);
        mesh.metadata.classInstance.model.parent = this.camera;

        //Set our hand to mesh
        if(right){
            this.right_hand =  mesh;
        }else{
            this.left_hand = mesh;
        }

        console.log("Grabbed %s: %s vs. %s", mesh.name, position, this.movement.position);
        console.log("%s", this.RIGHT_ARM.position.add(this.camera.position).add(this.movement.position));
    }

    removeGrab(right, position){
        var hand = (right)? this.right_hand:this.left_hand;
        console.log("SENT: %s",position);
        if(hand){
            // hand.metadata.classInstance.model.setAbsolutePosition(position);
            hand.metadata.classInstance.body.disablePreStep = true;
            hand.metadata.classInstance.body.setMotionType(PhysicsMotionType.DYNAMIC);
            hand.metadata.classInstance.model.parent = "";
            if(right){
                this.right_hand = "";
            }else{
                this.left_hand = "";
            }
            // console.log("Released %s: %s vs %s", hand.name, hand.metadata.classInstance.model.getAbsolutePosition(), this.movement.position);
            setTimeout(()=>{console.log("Released %s: %s (%s)",hand.name, hand.position, hand.getAbsolutePosition())}, 2000);
        }

        // console.log(this.movement.position);
        // console.log(hand.metadata.classInstance.model.getAbsolutePosition());
    }
}