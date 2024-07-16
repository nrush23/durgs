import { AbstractMesh, ArcRotateCamera, Axis, Color3, HighlightLayer, Mesh, PhysicsMotionType, PointerEventTypes, Quaternion, Ray, Scene, SceneLoader, TransformNode, UniversalCamera, Vector3, double, int } from "@babylonjs/core";
import { PlayerInput } from "./inputController";
import { Sliding_Window } from "./sliding_window";
import { Input_Cache } from "./input_cache";
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
    MAX_SPEED = .5;
    UPDATE_CACHE;

    INPUT_CACHE;

    RIGHT_ARM;

    //Sort by performance.now() values, send the index of the
    //NEXT_POSITION in the JSON

    //On receive, check if index (or maybe perfomance.now() value) matches
    //server value. If not, set that NEXT_POSITION value to server value
    //and reapply all remaining inputs.
    //In all cases, once you retrive a key from the server, discard all older
    //keys
    INPUT_CACHE2;

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
        this.INPUT_CACHE2 = new Sliding_Window(10);
        this.UPDATE_CACHE = "";
        this.INPUT_CACHE = new Input_Cache(10);
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
                // this.RIGHT_ARM = scene.getMeshByName("right_arm");
                this.RIGHT_ARM = meshes[4];
                this.RIGHT_ARM.parent = null;
                let position = this.camera.position.clone().addInPlace(this.camera.getForwardRay().direction.scale(1.2));
                position.y -= 0.2;
                position.x += 0.2;
                this.RIGHT_ARM.position = position;
                this.RIGHT_ARM.parent = this.camera;
                this.RIGHT_ARM.setEnabled(false);
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
            if (this.UPDATE_CACHE) {
                this.UPDATE_CACHE();
                this.UPDATE_CACHE = "";
            }
            this.render();
            // if (this.right_hand) {
            //     var position = this.RIGHT_ARM.getAbsolutePosition();
            //     // this.right_hand.metadata.classInstance.body.transformNode.position.set(position.x, position.y, position.z);
            //     this.right_hand.metadata.classInstance.body.transformNode.position = position.clone();

            //     /* WORKING CODE */
            //     // this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
            //     // this.RIGHT_ARM.position = this.camera.position.clone();
            //     // this.RIGHT_ARM.position.z -= 0.4;
            //     // this.RIGHT_ARM.rotation.x = this.camera.getForwardRay().direction.x;
            //     // this.RIGHT_ARM.rotation.y = -Math.PI/2;
            //     // this.RIGHT_ARM.position = this.camera.position.clone().addInPlace(this.camera.getForwardRay().direction.scale(1.2));
            //     // this.RIGHT_ARM.rotation.x *= -1;
            //     // this.RIGHT_ARM.rotation.z *= -1;
            // }
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

        // if (this.controller.vertical != 0 || this.controller.horizontal != 0) {

        var forward = this.camera.getForwardRay().direction;
        var veritcal_input = this.controller.vertical;
        var horizontal_input = this.controller.horizontal;

        //Testing
        let INPUT = new Array(4).fill(null);
        // let INPUT = ["", forward, veritcal_input, horizontal_input];
        INPUT[1] = forward;
        INPUT[2] = veritcal_input;
        INPUT[3] = horizontal_input;
        this.updateMovement(INPUT);

        //If the input can be added, update and send to server
        //Otherwise, we are still waiting on input to be validated
        //and can't accept more
        if (this.INPUT_CACHE.addToCache(INPUT)) {
            this.SOCKET.send(JSON.stringify({
                timestamp: Date.now(),
                type: "movement_input",
                PID: this.PID,
                vertical: veritcal_input,
                horizontal: horizontal_input,
                rotation: forward,
                twist: this.camera.rotation,
                index: this.INPUT_CACHE.LAST_SENT,
            }));
            this.PREVIOUS_POSITION = this.NEXT_POSITION.clone();
            this.movement.position = this.PREVIOUS_POSITION.clone();
            this.camera.position = this.PREVIOUS_POSITION.clone();
            this.movement.rotation = new Vector3(0, this.camera.rotation.y, 0);
            this.NEXT_POSITION = INPUT[0].clone();
        };
        //End Testing
    }

    updateInteract() {
        this.grab = this.controller.grabbed;
        var ray = new Ray(this.camera.position, this.camera.getForwardRay().direction);
        var hit = this.scene.pickWithRay(ray);
        if (this.grab) {
            if (hit.pickedMesh && this.right_hand != null) {
                hit.pickedMesh.metadata.classInstance.action(this);
            }
            // console.log(this.RIGHT_ARM.isEnabled(false));
            if (!this.RIGHT_ARM.isEnabled(false)) {
                this.SOCKET.send(JSON.stringify({
                    timestamp: Date.now(),
                    type: "arm_grab",
                    arm: "right",
                    PID: this.PID,
                }));
            }
            this.RIGHT_ARM.setEnabled(true);
        } else {
            if (this.right_hand) {
                this.right_hand.metadata.classInstance.action(this);
            }
            if (this.RIGHT_ARM.isEnabled(false)) {
                this.SOCKET.send(JSON.stringify({
                    timestamp: Date.now(),
                    type: "arm_retract",
                    arm: "right",
                    PID: this.PID,
                }));
            }
            this.RIGHT_ARM.setEnabled(false);
        }


        // if ((hit.pickedMesh && this.grab)) {
        //     hit.pickedMesh.metadata.classInstance.action(this);
        // } else if (!this.grab && this.right_hand) {
        //     this.right_hand.metadata.classInstance.action(this);
        // }

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


    // render() {
    //     const delta = this.scene.getEngine().getDeltaTime() / 1000;
    //     const interpolationFactor = Math.min(1, delta * 60);
    //     Vector3.LerpToRef(this.movement.position, this.NEXT_POSITION, interpolationFactor, this.movement.position);
    //     this.camera.position.copyFrom(this.movement.position);
    //     this.movement.rotation.y = this.camera.rotation.y;
    //     if (this.object) {
    //         this.object.metadata.classInstance.model.rotation = new Vector3(0,0,0);
    //         this.object.metadata.classInstance.model.position.copyFrom(this.MESH.getAbsolutePosition());
    //     }
    // }

    render() {
        const delta = this.scene.getEngine().getDeltaTime() / 1000;
        const interpolationFactor = Math.min(1, delta * 60);
        Vector3.LerpToRef(this.movement.position, this.NEXT_POSITION, interpolationFactor, this.movement.position);
        this.camera.position.copyFrom(this.movement.position);
        this.movement.rotation.y = this.camera.rotation.y;
        
        // if(this.right_hand){
        //     this.RIGHT_ARM.computeWorldMatrix(true);
        //     this.right_hand.metadata.classInstance.model.rotation = this.camera.rotation.clone();
        //     this.right_hand.metadata.classInstance.model.position.copyFrom(this.RIGHT_ARM.getAbsolutePosition());
        // }

        /*Code that jitters */
        // if (this.right_hand) {
        //     // var position = this.RIGHT_ARM.getAbsolutePosition();
        //     // this.right_hand.metadata.classInstance.body.transformNode.position.set(position.x, position.y, position.z);
        //     // this.right_hand.metadata.classInstance.body.transformNode.position = position.clone();
        //     // this.right_hand.metadata.classInstance.model.rotation = new Vector3(0,0,0);
        //     this.RIGHT_ARM.computeWorldMatrix(true);
        //     this.right_hand.metadata.classInstance.model.position.copyFrom(this.RIGHT_ARM.getAbsolutePosition());
        //     this.right_hand.metadata.classInstance.model.rotation = new Vector3(0, 0, 0);
        //     // Vector3.LerpToRef(this.right_hand.metadata.classInstance.model.position, this.RIGHT_ARM.getAbsolutePosition(), interpolationFactor, this.right_hand.metadata.classInstance.model.position);
        // }

        // if(present){
        // var position = this.mesh.getAbsolutePosition();
        // this.item.position = position.clone();
        // }
    }

    //New code to snap to the rollback
    removeFromCache(pos, index) {
        if (this.INPUT_CACHE.get(index) != null && !pos.equals(this.INPUT_CACHE.get(index)[0])) {
            console.log("OUT OF SYNC %s=%s %s=%s", index, pos, index, this.INPUT_CACHE.get(index)[0]);
            console.log(index % 10, this.INPUT_CACHE.CACHE);
            this.NEXT_POSITION = pos.clone();
            for (let i = index + 1; i < this.INPUT_CACHE.LAST_SENT; i++) {
                let INPUT = this.INPUT_CACHE.get(i);
                this.updateMovement(INPUT);
                this.PREVIOUS_POSITION = this.NEXT_POSITION.clone();
                this.NEXT_POSITION = input[0];
                this.movement.position = this.PREVIOUS_POSITION.clone();
                this.camera.position = this.movement.position.clone();
            }
        }
        this.INPUT_CACHE.removeFromCache(index);
    }

    updateMovement(input) {
        let ROTATION = input[1];
        let VERTICAL = input[2];
        let HORIZONTAL = input[3];
        let forward = new Vector3(ROTATION.x * this.MAX_SPEED, ROTATION.y * this.MAX_SPEED, ROTATION.z * this.MAX_SPEED);
        let backward = forward.scale(-1);
        let left = new Vector3(-ROTATION._z * this.MAX_SPEED, ROTATION._y * this.MAX_SPEED, ROTATION._x * this.MAX_SPEED);
        // let left = new Vector3(-ROTATION.z * this.MAX_SPEED, 0, ROTATION.x * this.MAX_SPEED);
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

    addGrab(item) {
        var mesh = this.scene.getMeshByName(item);
        mesh.metadata.classInstance.body.disablePreStep = false;
        // mesh.metadata.classInstance.model.position.set(this.RIGHT_ARM.position);
        // mesh.metadata.classInstance.model.parent = this.camera;

        mesh.metadata.classInstance.body.setMotionType(PhysicsMotionType.STATIC);
        this.RIGHT_ARM.computeWorldMatrix(true);
        // mesh.metadata.classInstance.model.position.copyFrom(this.RIGHT_ARM.getAbsolutePosition());
        mesh.metadata.classInstance.model.position.copyFrom(this.RIGHT_ARM.position);
        mesh.metadata.classInstance.model.parent = this.camera;
        // this.right_hand.metadata.classInstance.model.rotation = this.camera.rotation.clone();
        // this.right_hand.metadata.classInstance.model.position.copyFrom(this.RIGHT_ARM.getAbsolutePosition());

        this.right_hand = mesh;
    }

    removeGrab() {
        if (this.right_hand) {
            this.right_hand.metadata.classInstance.body.disablePreStep = true;
            this.right_hand.metadata.classInstance.body.setMotionType(PhysicsMotionType.DYNAMIC);
            this.right_hand.metadata.classInstance.model.parent = "";
            // this.right_hand.metadata.classInstance.model.parent = "";
            this.right_hand = "";
        }
    }
}