import { Mesh, Scene, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";

export default class Player {
    PID;
    // WID;
    username;
    position;
    // scene;
    socket;
    texture;
    right_hand;
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
    ARM_ANGLE;

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
        SceneLoader.ImportMesh("body", "http://localhost:3001/assets/", "player.glb", this.scene, (meshes) => {
            // console.log(meshes);
            if (meshes.length > 0) {
                this.model = meshes[0];
                this.model.name = this.username;
                this.movement = new TransformNode(this.PID, this.scene);
                this.movement.position = new Vector3(0, 0, 0);
                this.model.parent = this.movement;

                //TESTING, ADDING ARMS


                //END TESTING
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
        console.log("CURRENT: %s, TWIST: %s, ROTATION: %s, VERT: %s, HORZ: %s", CURRENT, TWIST, ROTATION, VERTICAL, HORIZONTAL);

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
    }

    /*Add new input messages to the buffer for processing on next
    world update */
    addInput(vertical, horizontal, rotation, twist, index) {
        this.INPUT_BUFFER.push([vertical, horizontal, rotation, twist, index]);
    }
}