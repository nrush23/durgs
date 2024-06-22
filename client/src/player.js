import { AbstractMesh, ArcRotateCamera, Axis, Color3, HighlightLayer, Mesh, PointerEventTypes, Ray, Scene, SceneLoader, TransformNode, UniversalCamera, Vector3, double, int } from "@babylonjs/core";
import { PlayerInput } from "./inputController";
import { Sliding_Window } from "./sliding_window";
const pocket = {
    empty: 'EMPTY',
    full: 'FULL'
};
export class Player {
    PID;
    username;
    model = null;
    movement;
    scene;
    camera;
    controller;
    right_hand = "";
    grab = false;
    SOCKET;
    NEXT_POSITION;
    PREVIOUS_POSITION;
    MAX_SPEED = 3;
    UPDATE_CACHE;

    //Sort by performance.now() values, send the index of the
    //NEXT_POSITION in the JSON

    //On receive, check if index (or maybe perfomance.now() value) matches
    //server value. If not, set that NEXT_POSITION value to server value
    //and reapply all remaining inputs.
    //In all cases, once you retrive a key from the server, discard all older
    //keys
    INPUT_CACHE;

    static PLAYER_SPEED = 0.45;
    static JUMP_FORCE = 0.80;
    static GRAVITY = -2.8;
    static ORIGINAL_TILT = new Vector3(0.5934119456780721, 0, 0);


    constructor(scene, camera, socket) {
        this.scene = scene;
        this.PID = -1;
        this.username = "null";
        this.camera = camera;
        this.movement = new TransformNode("player", scene);
        this.movement.position = new Vector3(0, 0, 0);
        this.right_hand = "";
        this.SOCKET = socket;
        this.controller = new PlayerInput(scene);
        this.NEXT_POSITION = new Vector3(0, 0, 0);
        this.PREVIOUS_POSITION = new Vector3(0, 0, 0);
        this.INPUT_CACHE = new Sliding_Window(10);
        this.UPDATE_CACHE = "";
    }

    createBody(scene, texture) {
        this.scene = scene;
        SceneLoader.ImportMesh("body", "", "./assets/player.glb", this.scene, (meshes) => {
            if (meshes.length > 0) {
                // console.log(meshes);
                this.model = meshes[0];
                this.model.name = "player_body";
                this.model.parent = this.movement;
                meshes.forEach(mesh => {
                    mesh.isPickable = false;
                    mesh.enablePointerMoveEvents = false;
                });
                // console.log(this.model);
            }
        });
        // this.controller = new PlayerInput(scene);
        this.camera.inputs.remove(this.camera.inputs.attached.keyboard);

        //Set up mouse pointer input
        this.setupPointer();

        // scene.registerBeforeRender(() => {
        //     // this.updateInteract();
        //     // this.updatePosition();
        // });
        scene.registerBeforeRender(() => {
            this.render();
            if (this.UPDATE_CACHE) {
                this.UPDATE_CACHE();
                this.UPDATE_CACHE = "";
            }
        });
    }

    updateChildren() {
        console.log(this.PID);
        this.SOCKET.send(JSON.stringify({
            timestamp: Date.now(),
            type: "movement",
            PID: this.PID,
            position: this.movement.position,
            rotation: this.camera.rotation,
        }));
        this.camera.position = this.movement.position.clone();
        // this.model.position = this.movement.position.clone();
        if (this.right_hand) {
            // this.right_hand.position = this.movement.position.clone();
            this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
            // this.right_hand.metadata.classInstance.body.position.set(this.movement.position.clone());
        }
    }

    sendPosition2() {
        let modifier = 5;
        var forward = this.camera.getForwardRay().direction;
        var right = Vector3.Cross(Axis.Y, forward, 100);
        if (this.controller.vertical != 0 || this.controller.horizontal != 0) {

            var moveDirection = forward.scale(this.controller.vertical / modifier).add(right.scale(this.controller.horizontal / modifier));
            this.movement.position.addInPlace(moveDirection);

            this.SOCKET.send(JSON.stringify({
                timestamp: Date.now(),
                type: "movement",
                PID: this.PID,
                position: this.movement.position,
                rotation: this.camera.rotation,
            }));

            this.camera.position = this.movement.position.clone();

        }
        this.movement.rotation = this.camera.rotation;
        if (this.right_hand) {
            this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
        }
    }
    sendPosition() {

        if (this.controller.vertical != 0 || this.controller.horizontal != 0) {

            // var veritcal_input = (this.controller.vertical > 0)? "UP": (this.controller.vertical < 0)? "DOWN":"";
            // var horizontal_input = (this.controller.horizontal > 0)? "RIGHT": (this.controller.horizontal < 0)? "LEFT":"";
            var forward = this.camera.getForwardRay().direction;
            var veritcal_input = this.controller.vertical;
            var horizontal_input = this.controller.horizontal;
            this.SOCKET.send(JSON.stringify({
                timestamp: Date.now(),
                type: "movement_input",
                PID: this.PID,
                vertical: veritcal_input,
                horizontal: horizontal_input,
                rotation: forward,
                index: this.INPUT_CACHE.getEnd(),   //this one I can get rid of
            }));
            let INPUT = ["", forward, veritcal_input, horizontal_input];
            console.log("INPUT BEFORE: %s", INPUT);
            this.updateMovement(INPUT);
            console.log("INPUT AFTER: %s", INPUT);
            this.PREVIOUS_POSITION = this.NEXT_POSITION.clone();
            this.movement.position = this.PREVIOUS_POSITION.clone();
            this.camera.position = this.PREVIOUS_POSITION.clone();
            this.movement.rotation = forward;
            this.NEXT_POSITION = INPUT[0];
            this.INPUT_CACHE.addToWindow(INPUT);
            console.log(this.INPUT_CACHE.WINDOW);

            /* OLD CODE */
            // //Client side prediction portion, same as server
            // forward.x *= this.MAX_SPEED;
            // forward.z *= this.MAX_SPEED;
            // forward.y = 0;
            // let backward = forward.scale(-1);
            // let left = new Vector3(-forward.z, 0, forward.x);
            // let right = left.scale(-1);
            // if (this.controller.vertical) {
            //     this.NEXT_POSITION.addInPlace((this.controller.vertical == "UP") ? forward : backward);
            // }
            // if (this.controller.horizontal) {
            //     this.NEXT_POSITION.addInPlace((this.controller.horizontal == "LEFT") ? left : right);
            // }
            // this.movement.rotation = forward;
            // this.movement.position = this.PREVIOUS_POSITION;
            // this.INPUT_CACHE.addToWindow([this.NEXT_POSITION, forward, this.controller.vertical, this.controller.horizontal]);
            // console.log(this.INPUT_CACHE.WINDOW);
        }
    }

    updateInteract() {
        this.grab = this.controller.grabbed;
        var ray = new Ray(this.camera.position, this.camera.getForwardRay().direction);
        var hit = this.scene.pickWithRay(ray);
        if ((hit.pickedMesh && this.grab)) {
            hit.pickedMesh.metadata.classInstance.action(this);
        } else if (!this.grab && this.right_hand) {
            this.right_hand.metadata.classInstance.action(this);
        }

    }

    setupPointer() {
        // On click event, request pointer lock
        this.scene.onPointerDown = function (evt) {
            //true/false check if we're locked, faster than checking pointerlock on each single click.
            if (!this.isLocked) {
                canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
        };

        // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
        var pointerlockchange = function () {
            var controlEnabled = document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || null;
            // If the user is already locked
            if (!controlEnabled) {
                this.isLocked = false;
            } else {
                this.isLocked = true;
            }
        };

        // Attach events to the document
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);

    }

    render() {
        // console.log(this.NEXT_POSITION);
        const delta = this.scene.getEngine().getDeltaTime() / 1000;
        const interpolationFactor = Math.min(1, delta * 60);
        // this.movement.position.lerpTo(this.NEXT_POSITION, interpolationFactor);
        Vector3.LerpToRef(this.movement.position, this.NEXT_POSITION, interpolationFactor, this.movement.position);
        this.camera.position = this.movement.position.clone();
        this.movement.rotation = this.camera.rotation;
    }

    //Write code to set the correction to our current position
    //and apply the remaining inputs
    removeFromCache(pos, index) {
        console.log(index);
        if (this.INPUT_CACHE.get(index) != null && !this.INPUT_CACHE.get(index)[0].equals(pos)) {
            console.log("OUT OF SYNC %s=%s %s=%s", index, pos, index, this.INPUT_CACHE.get(index)[0]);
            this.NEXT_POSITION.position = pos;
            for (let i = index + 1; i < this.INPUT_CACHE.END; i++) {
                let input = this.INPUT_CACHE.WINDOW[i % this.INPUT_CACHE.WINDOW.length];
                this.updateMovement(input);
                this.PREVIOUS_POSITION = this.NEXT_POSITION.clone();
                this.NEXT_POSITION = input[0];
                this.movement.position = this.PREVIOUS_POSITION.clone();
                this.camera.position = this.movement.position.clone();
                /* OLD CODE */
                // let input = this.INPUT_CACHE.WINDOW[i % this.INPUT_CACHE.WINDOW.length];
                // let forward = input[1];
                // forward.x *= this.MAX_SPEED;
                // forward.z *= this.MAX_SPEED;
                // forward.y = 0;
                // let backward = forward.scale(-1);
                // let left = new Vector3(-forward.z, 0, forward.x);
                // let right = left.scale(-1);
                // if (input[2]) {
                //     (i == this.INPUT_CACHE.END - 1) ? this.NEXT_POSITION.addInPlace((this.controller.vertical == "UP") ? forward : backward) : this.movement.position.addInPlace(input[2] == "UP" ? forward : backward);
                // }
                // if (input[3]) {
                //     (i == this.INPUT_CACHE.END - 1) ? this.NEXT_POSITION.addInPlace((this.controller.horizontal == "LEFT") ? left : right) : this.movement.position.addInPlace(input[3] == "LEFT" ? left : right);
                // }
                // this.movement.rotation = forward;
                // this.camera.position = this.movement.position.clone();
                // input[0] = (i == this.INPUT_CACHE.END - 1) ? this.NEXT_POSITION : this.movement.position;
            }
        }
        this.INPUT_CACHE.removeFromWindow(index);
    }

    updateMovement(input) {
        let ROTATION = input[1];
        let VERTICAL = input[2];
        let HORIZONTAL = input[3];
        let forward = new Vector3(ROTATION.x * this.MAX_SPEED, 0, ROTATION.z * this.MAX_SPEED);
        let backward = forward.scale(-1);
        // let left = new Vector3(-ROTATION._z * this.MAX_SPEED, ROTATION._y * this.MAX_SPEED, ROTATION._x * this.MAX_SPEED);
        let left = new Vector3(-ROTATION.z * this.MAX_SPEED, 0, ROTATION.x * this.MAX_SPEED);
        let right = left.scale(-1);
        let NEW_POSITION = this.NEXT_POSITION.clone();
        if (VERTICAL == "UP") {
            NEW_POSITION.addInPlace(forward);
        } else if (VERTICAL == "DOWN") {
            NEW_POSITION.addInPlace(backward);
        }

        if (HORIZONTAL == "LEFT") {
            NEW_POSITION.addInPlace(left);
        } else if (HORIZONTAL == "RIGHT") {
            NEW_POSITION.addInPlace(right);
        }
        input[0] = NEW_POSITION;
        // this.movement.rotation = new Vector3(ROTATION._x, ROTATION._y, ROTATION._z);
    }

    applyFromCache(index) {

    }
}