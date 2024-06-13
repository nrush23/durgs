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
    NEXT_POSITION;

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
        this.NEXT_POSITION = new Vector3(0,0,0);
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
        scene.registerBeforeRender(()=>{
            this.render();
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

    sendPosition2(){
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

        var forward = this.camera.getForwardRay().direction;
        if (this.controller.vertical != 0 || this.controller.horizontal != 0) {

            var veritcal_input = (this.controller.vertical > 0)? "UP": (this.controller.vertical < 0)? "DOWN":"";
            var horizontal_input = (this.controller.horizontal > 0)? "RIGHT": (this.controller.horizontal < 0)? "LEFT":"";
            this.SOCKET.send(JSON.stringify({
                timestamp: Date.now(),
                type: "movement_input",
                PID: this.PID,
                vertical: veritcal_input,
                horizontal: horizontal_input,
                rotation: forward,
                position: this.movement.position
            }));

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

    render(){
        // console.log(this.NEXT_POSITION);
        const delta = this.scene.getEngine().getDeltaTime()/1000;
        const interpolationFactor = Math.min(1, delta * 60);
        // this.movement.position.lerpTo(this.NEXT_POSITION, interpolationFactor);
        Vector3.LerpToRef(this.movement.position, this.NEXT_POSITION, interpolationFactor, this.movement.position);
        this.camera.position = this.movement.position.clone();
        this.movement.rotation = this.camera.rotation;
    }
}