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

    constructor() {
        this.PID = -1;
        this.username = null;
        // this.WID = -1;
        this.socket = null;
        this.texture = null;
        this.position = new Vector3(0, 0, 0);
        this.right_hand = "";
        this.moved = "";
        this.NETWORK_CACHE = [];
        this.INPUT_BUFFER = [];
        this.MAX_SPEED = 3;
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
                console.log("%s entered the scene", this.username);
            }
        })
    }

    setModel(mesh) {
        this.model = mesh;
    }

    render(pos, rot) {
        if (this.movement) {
            this.movement.position = new Vector3(pos._x, pos._y, pos._z);
            this.movement.rotation = new Vector3(rot._x, rot._y, rot._z);
        }
    }

    render2(input) {
        // console.log(input);
        let CURRENT = input[3];
        // let ROTATION = JSON.parse(input[2]);
        let ROTATION = input[2];
        let VERTICAL = input[0];
        let HORIZONTAL = input[1];
        console.log("CURRENT: %s, ROTATION: %s, VERT: %s, HORZ: %s", CURRENT, ROTATION, VERTICAL, HORIZONTAL);
        // if (VERTICAL == "UP") {
        //     this.movement.position.addInPlace(new Vector3(ROTATION._x * this.MAX_SPEED, 0, ROTATION._z * this.MAX_SPEED));
        // } else if (VERTICAL == "DOWN") {
        //     this.movement.position.subtractInPlace(new Vector3(ROTATION._x * this.MAX_SPEED, 0, ROTATION._z * this.MAX_SPEED));
        // }

        // if (HORIZONTAL == "LEFT") {
        //     this.movement.position.subtractInPlace(new Vector3(ROTATION._y * this.MAX_SPEED, 0, ROTATION._x * this.MAX_SPEED));
        // } else if (HORIZONTAL == "RIGHT") {
        //     this.movement.position.addInPlace(new Vector3(ROTATION._y * this.MAX_SPEED, 0, ROTATION._x * this.MAX_SPEED));
        // }

        // let forward = new Vector3(ROTATION._x * this.MAX_SPEED, ROTATION._y * this.MAX_SPEED, ROTATION._z * this.MAX_SPEED);
        let forward = new Vector3(ROTATION._x * this.MAX_SPEED, 0, ROTATION._z * this.MAX_SPEED);
        let backward = forward.scale(-1);
        // let left = new Vector3(-ROTATION._z * this.MAX_SPEED, ROTATION._y * this.MAX_SPEED, ROTATION._x * this.MAX_SPEED);
        let left = new Vector3(-ROTATION._z * this.MAX_SPEED, 0, ROTATION._x * this.MAX_SPEED);
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


        this.movement.rotation = new Vector3(ROTATION._x, ROTATION._y, ROTATION._z);
    }

    // render2(input) {
    //     console.log(input);
    //     let CURRENT = input[3];
    //     // let ROTATION = JSON.parse(input[2]);
    //     let ROTATION = input[2];
    //     let VERTICAL = input[0];
    //     let HORIZONTAL = input[1];

    //     if (VERTICAL == "UP") {
    //         this.movement.position.x += this.MAX_SPEED;
    //     } else if (VERTICAL == "DOWN") {
    //         this.movement.position.x -= this.MAX_SPEED;
    //     }

    //     if (HORIZONTAL == "LEFT") {
    //         this.movement.position.z -= this.MAX_SPEED;
    //     } else if (HORIZONTAL == "RIGHT") {
    //         this.movement.position.z += this.MAX_SPEED;
    //     }

    //     this.movement.rotation = new Vector3(ROTATION._x, ROTATION._y, ROTATION._z);
    // }

    updatePosition(pos, rot) {
        // if (this.model) {
        // console.log(pos);
        // this.previous_position = this.movement.position;
        // this.movement.position = new Vector3(pos._x, pos._y, pos._z);
        // console.log("%s: <%s,%s,%s>", this.username, this.movement.position.x, this.movement.position.y, this.movement.position.z);
        this.NETWORK_CACHE.push([pos, rot]);
        // }
    }

    addInput(vertical, horizontal, position, rotation) {
        this.INPUT_BUFFER.push([vertical, horizontal, rotation, position]);
    }

    //for adding actions to the network cache eventually
    addAction(action) {

    }
}