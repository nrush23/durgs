import { AbstractMesh, ArcRotateCamera, Axis, Color3, HighlightLayer, Mesh, PointerEventTypes, Ray, Scene, SceneLoader, TransformNode, UniversalCamera, Vector3, double, int } from "@babylonjs/core";
import { PlayerInput } from "./inputController";
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
    cam_root;
    controller;
    isLocked = false;
    right_hand = "";
    // right_item;
    grab = false;
    SOCKET;

    static PLAYER_SPEED = 0.45;
    static JUMP_FORCE = 0.80;
    static GRAVITY = -2.8;
    static ORIGINAL_TILT = new Vector3(0.5934119456780721, 0, 0);


    constructor(scene, camera, socket) {
        this.scene = scene;
        this.PID = -1;
        this.username = "null";
        // this.model = new AbstractMesh("", this.scene);
        this.camera = camera;
        this.movement = new TransformNode("player", scene);
        this.movement.position = new Vector3(0, 0, 0);
        // this.camera.parent = this.movement;
        this.right_hand = "";
        this.SOCKET = socket;
    }

    createBody(scene, texture) {
        this.scene = scene;
        SceneLoader.ImportMesh("body", "", "./assets/player.glb", this.scene, (meshes) => {
            if (meshes.length > 0) {
                console.log(meshes);

                // this.model = scene.getMeshByName("body");
                this.model = meshes[0];
                // this.model.isPickable = false;
                // this.model.enablePointerMoveEvents = false;
                // this.model = this.model.parent;
                this.model.name = "player_body";
                this.model.parent = this.movement;
                meshes.forEach(mesh =>{
                    mesh.isPickable = false;
                    mesh.enablePointerMoveEvents = false;
                });
                console.log(this.model);
            }
        });
        this.controller = new PlayerInput(scene);
        this.camera.inputs.remove(this.camera.inputs.attached.keyboard);

        //Set up mouse pointer input
        this.setupPointer();

        scene.registerBeforeRender(() => {
            this.updatePosition();
            this.updateGrab();
        });
    }

    updateChildren() {
        console.log(this.PID);
        this.SOCKET.send(JSON.stringify({
            timestamp: Date.now(),
            type: "movement",
            PID: this.PID,
            position: this.movement.position,
        }));
        this.camera.position = this.movement.position.clone();
        // this.model.position = this.movement.position.clone();
        if (this.right_hand) {
            this.right_hand.position = this.movement.position.clone();
        }
    }
    updatePosition() {

        let modifier = 5;
        var forward = this.camera.getForwardRay().direction;
        var right = Vector3.Cross(Axis.Y, forward, 100);
        if (this.controller.vertical != 0 || this.controller.horizontal != 0) {
            var moveDirection = forward.scale(this.controller.vertical / modifier).add(right.scale(this.controller.horizontal / modifier));

            this.movement.position.addInPlace(moveDirection);
            this.updateChildren();
        }
    }

    updateGrab() {
        this.grab = this.controller.grabbed;
        var ray = new Ray(this.camera.position, this.camera.getForwardRay().direction);
        var hit = this.scene.pickWithRay(ray);
        if((hit.pickedMesh && this.grab)){
            hit.pickedMesh.parent.metadata.classInstance.action(this);
        }else if (!this.grab && this.right_hand){
            this.right_hand.metadata.classInstance.action(this);
        }
        // if (hit.pickedMesh && this.grab && !this.right_hand && hit.pickedMesh.isPickable) {
        //     this.right_hand = hit.pickedMesh.parent;
        //     console.log("Hit an object: %s", hit.pickedMesh.name);
        //     // this.SOCKET.send(JSON.stringify({
        //     //     timestamp: Date.now(),
        //     //     type: "grab",
        //     //     PID: this.PID,
        //     //     item: this.right_hand.name
        //     // }));
        // } else if (!this.grab && this.right_hand) {
        //     this.SOCKET.send(JSON.stringify({
        //         timestamp: Date.now(),
        //         type: "release",
        //         PID: this.PID,
        //         item: this.right_hand.name,
        //         position: this.movement.position
        //     }));
        //     this.right_hand.position.y = 0;
        //     this.right_hand = "";
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
}