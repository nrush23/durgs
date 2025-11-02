import { AbstractMesh, RayHelper, PhysicsEventType, PhysicsViewer, ArcRotateCamera, Axis, Color3, HighlightLayer, Mesh, PhysicsBody, PhysicsShapeBox, PhysicsMotionType, PointerEventTypes, Quaternion, Ray, Scene, SceneLoader, TransformNode, UniversalCamera, Vector3, double, int, HavokPlugin, PhysicsShapeMesh } from "@babylonjs/core";
import { PlayerInput } from "./inputController";
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
    grab = false;
    SOCKET;
    NEXT_POSITION;
    PREVIOUS_POSITION;
    MAX_SPEED = .5;
    UPDATE_CACHE;

    INPUT_CACHE;

    left_hand = "";
    right_hand = "";
    LEFT_ARM;
    RIGHT_ARM;

    //Legacy attributes from Babylon.js tutorial
    static PLAYER_SPEED = 0.45;
    static JUMP_FORCE = 0.80;
    static GRAVITY = -2.8;
    static ORIGINAL_TILT = new Vector3(0.5934119456780721, 0, 0);

    //XMAS ADDITION
    bean;
    skin = "normal";

    /*Initialize the player's attributes*/
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
        this.UPDATE_CACHE = "";
        this.INPUT_CACHE = new Input_Cache(10);

        this.camera.parent = this.movement;
    }

    /*Create the meshes that make up the player model */
    createBody(scene, texture) {
        this.scene = scene;
        SceneLoader.ImportMesh("body", "", "./assets/player2.glb", this.scene, (meshes) => {
            if (meshes.length > 0) {
                // console.log(meshes);

                //Create the main bean body
                this.model = meshes[0];
                this.model.name = "player_body";
                this.model.parent = this.movement;
                this.model.setEnabled(false);

                //Create the left arm and make it hidden by default
                this.LEFT_ARM = meshes[2];
                this.LEFT_ARM.parent = null;
                this.LEFT_ARM.hand = meshes[3];
                this.LEFT_ARM.parent = this.camera;
                this.createArm(false);

                //Create the right arm and make it hidden by default
                this.RIGHT_ARM = meshes[4];
                this.RIGHT_ARM.parent = null;
                this.RIGHT_ARM.parent = this.camera;
                this.createArm(true);

                //Now make each imported mesh unclickable
                meshes.forEach(mesh => {
                    mesh.isPickable = false;
                    mesh.enablePointerMoveEvents = false;
                });

                this.bean = meshes[5];
            }
        });

        //Remove the camera's built in keyboard functionality so it doesn't
        //interfere with player input
        this.camera.inputs.remove(this.camera.inputs.attached.keyboard);

        //Set up mouse pointer input
        this.setupPointer();

        //Add the player's render loop to the scene
        scene.registerBeforeRender(() => {
            if (this.UPDATE_CACHE) {
                this.UPDATE_CACHE();
                this.UPDATE_CACHE = "";
            }
            this.render();
        });
    }

    createArm(right) {
        var arm = (right) ? this.RIGHT_ARM : this.LEFT_ARM;
        const shape = new PhysicsShapeMesh(arm, this.scene);
        arm.body = new PhysicsBody(arm, PhysicsMotionType.STATIC, false, this.scene);
        arm.body.shape = shape;
        arm.body.setMassProperties({ mass: 1 });
        arm.body.setCollisionCallbackEnabled(true);
        arm.body.disablePreStep = false;

        arm.RAY = new Ray();
        arm.RAY_HELPER = new RayHelper(arm.RAY);
        arm.RAY_HELPER.attachToMesh(arm, new Vector3(0, 0, 1), Vector3.Zero(), 2);
        // arm.RAY_HELPER.show(this.scene);

        // var viewer = new PhysicsViewer(this.scene);
        // viewer.showBody(arm.body);

        this.enableArm(false, right);
    }

    sendPosition() {

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
            this.NEXT_POSITION = INPUT[0].clone();

            //TESTING
            this.model.rotation = new Vector3(0, this.camera.rotation.y, 0);
        };
        //End Testing
    }


    /*Player function to signal item and player interactions */
    updateInteract() {
        this.grab = this.controller.grab_right;


        //TESTING
        if (this.controller.grab_left) {
            if (!this.LEFT_ARM.isEnabled(false)) {
                this.SOCKET.send(JSON.stringify({
                    timestamp: Date.now(),
                    type: "arm_extend",
                    arm: "left",
                    PID: this.PID,
                }));
                this.enableArm(true, false);
            }
            var left_hit = this.scene.pickWithRay(this.LEFT_ARM.RAY);
            if (left_hit.pickedMesh && !this.left_hand) {
                left_hit.pickedMesh.metadata.classInstance.onAction(this, false);
            }
        } else {
            if (this.LEFT_ARM.isEnabled(false)) {
                this.SOCKET.send(JSON.stringify({
                    timestamp: Date.now(),
                    type: "arm_retract",
                    arm: "left",
                    PID: this.PID,
                }));
                this.enableArm(false, false);
            }
            if (this.left_hand) {
                this.left_hand.metadata.classInstance.offAction(this, false);
            }
        }





        //Run through the arm action and item actions
        if (this.grab) {

            //Extend the arm if not already extended
            if (!this.RIGHT_ARM.isEnabled(false)) {
                this.SOCKET.send(JSON.stringify({
                    timestamp: Date.now(),
                    type: "arm_extend",
                    arm: "right",
                    PID: this.PID,
                }));
                this.enableArm(true, true);
            }
            var right_hit = this.scene.pickWithRay(this.RIGHT_ARM.RAY);
            if (right_hit.pickedMesh && !this.right_hand) {
                right_hit.pickedMesh.metadata.classInstance.onAction(this, true);
            }
        } else {
            //No longer grabbing, retract the arm
            if (this.RIGHT_ARM.isEnabled(false)) {
                this.SOCKET.send(JSON.stringify({
                    timestamp: Date.now(),
                    type: "arm_retract",
                    arm: "right",
                    PID: this.PID,
                }));
                this.enableArm(false, true);
            }

            //If a item was being held, call its class action
            if (this.right_hand) {
                this.right_hand.metadata.classInstance.offAction(this, true);
            }
        }

        //XMAS ADDITION
        if (this.controller.creepy) {
            this.SOCKET.send(JSON.stringify({
                timestamp: Date.now(),
                type: "skin",
                name: "creepy",
                PID: this.PID,
            }));
        }

        if (this.controller.sled) {
            this.SOCKET.send(JSON.stringify({
                timestamp: Date.now(),
                type: "skin",
                name: "sled",
                PID: this.PID,
            }));
        }

    }

    enableSkin(name) {
        switch (name) {
            case 'creepy':
                this.bean.material.albedoTexture.uAng += Math.PI;
                break;
            case 'sled':
                break
            default:
                break;
        }
    }



    /*Enable or disable the right or left arms completely */
    enableArm(enable, right) {
        var arm = (right) ? this.RIGHT_ARM : this.LEFT_ARM;
        if (enable) {
            this.scene.hk._hknp.HP_World_AddBody(this.scene.hk.world, arm.body._pluginData.hpBodyId, false);
        } else {
            this.scene.hk._hknp.HP_World_RemoveBody(this.scene.hk.world, arm.body._pluginData.hpBodyId);

        }
        arm.setEnabled(enable);
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

    /*Frame update of the player's movement and position */
    render() {
        const delta = this.scene.getEngine().getDeltaTime() / 1000;
        const interpolationFactor = Math.min(0.5, delta * 60);
        Vector3.LerpToRef(this.movement.position, this.NEXT_POSITION, interpolationFactor, this.movement.position);
        this.model.rotation.y = this.camera.rotation.y;
    }

    /*Verify player movement with server corrections and rollback when out of sync */
    removeFromCache(pos, index) {

        //We are out of sync when the index is valid and the positions do not match
        if (this.INPUT_CACHE.get(index) != null && !pos.equals(this.INPUT_CACHE.get(index)[0])) {
            console.log("OUT OF SYNC %s=%s %s=%s", index, pos, index, this.INPUT_CACHE.get(index)[0]);

            //Correct by setting the NEXT_POSITION to the server position
            this.NEXT_POSITION = pos.clone();

            //Now manually reapply the movement cache to resync correct positions
            for (let i = index + 1; i < this.INPUT_CACHE.LAST_SENT; i++) {
                let INPUT = this.INPUT_CACHE.get(i);
                this.updateMovement(INPUT);
                this.PREVIOUS_POSITION = this.NEXT_POSITION.clone();
                this.NEXT_POSITION = INPUT[0];
                this.movement.position = this.PREVIOUS_POSITION.clone();
                // this.camera.position = this.movement.position.clone();
            }
        }

        //Either way we update the INPUT_CACHE to reflect our last
        //received index from the server
        this.INPUT_CACHE.removeFromCache(index);
    }

    /*Applies the movement algorithm to the given set of input values*/
    updateMovement(input) {
        let ROTATION = input[1];
        let VERTICAL = input[2];
        let HORIZONTAL = input[3];

        //Setting the y value to 0 = walking, non-zero = flying
        let forward = new Vector3(ROTATION.x * this.MAX_SPEED, ROTATION.y * this.MAX_SPEED, ROTATION.z * this.MAX_SPEED);
        let backward = forward.scale(-1);
        let left = new Vector3(-ROTATION._z * this.MAX_SPEED, ROTATION._y * this.MAX_SPEED, ROTATION._x * this.MAX_SPEED);
        // let left = new Vector3(-ROTATION.z * this.MAX_SPEED, 0, ROTATION.x * this.MAX_SPEED);
        let right = left.scale(-1);

        //Apply inputs by adding the vectors to the a copy of NEXT_POSITION
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

        //Store the NEW_POSITION in the zero index
        input[0] = NEW_POSITION;
    }




    /*Set the given item name to the player's right hand */
    addGrab(item, right) {

        //Retrieve the mesh and disable its physics updates
        var mesh = this.scene.getMeshByName(item);
        console.log(mesh);
        mesh.metadata.classInstance.setEnabled(false);
        if (!mesh.metadata.classInstance.valid) {
            mesh.metadata.classInstance.addCollision();
        }
        this.scene.hk._hknp.HP_World_RemoveBody(this.scene.hk.world, mesh.metadata.classInstance.body._pluginData.hpBodyId);
        if (right) {
            //Make sure RIGHT_ARM's position is up to date
            this.RIGHT_ARM.computeWorldMatrix(true);
        } else {
            this.LEFT_ARM.computeWorldMatrix(true);
        }

        //Copy the RIGHT_ARM's position, push it a little bit forward, reset the rotation,
        //and parent to the camera
        let position = (right) ? this.RIGHT_ARM.position.clone() : this.LEFT_ARM.position.clone();
        console.log(position);
        position.z += 1;
        mesh.metadata.classInstance.model.position = position;
        mesh.metadata.classInstance.model.rotation = new Vector3(0, 0, 0);
        if (mesh.metadata.classInstance.bottom) {
            mesh.metadata.classInstance.breakLink();
        }

        mesh.metadata.classInstance.model.parent = this.camera;

        if (right) {
            //Set our right_hand to mesh
            this.right_hand = mesh;
        } else {
            this.left_hand = mesh;
        }

        console.log("arm: %s", this.RIGHT_ARM.getAbsolutePosition());
    }



    /*Remove the current item from the player's right hand */
    removeGrab(right) {
        this.scene.executeOnceBeforeRender(() => {
            var hand = (right) ? this.right_hand : this.left_hand;
            if (hand) {
                console.log(hand);
                this.scene.hk._hknp.HP_World_AddBody(this.scene.hk.world, hand.metadata.classInstance.body._pluginData.hpBodyId, false);
                hand.metadata.classInstance.body.disablePreStep = true;
                console.log("%s %s", hand.metadata.classInstance.body.motionType, hand.metadata.classInstance.body.getMotionType());
                hand.metadata.classInstance.body.setMotionType(PhysicsMotionType.DYNAMIC);
                console.log("%s %s", hand.metadata.classInstance.body.motionType, hand.metadata.classInstance.body.getMotionType());
                hand.metadata.classInstance.model.parent = "";
                // console.log("%s", hand.metadata.classInstance.model.getAbsolutePosition());
                if (right) {
                    this.right_hand = "";
                } else {
                    this.left_hand = "";
                }
                console.log("%s: %s", hand.name, hand.metadata.classInstance.model.getAbsolutePosition());
            }
        });
    }
}