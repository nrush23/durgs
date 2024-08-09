import { PhysicsMotionType, StandardMaterial, Texture, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
//Class for controlling other players who join the world
export class Member {
    username;
    model = null;
    movement;
    scene;
    right_hand = "";
    left_hand = "";
    grab = false;
    NEXT_POSITION;
    PREVIOUS_POSITION;
    RIGHT_ARM;
    LEFT_ARM;
    ARM_ANGLE;

    constructor(username, scene, position, texture, creepy) {

        //Intialize the transform nodes and position vectors
        this.username = username;
        this.movement = new TransformNode(username, scene);
        this.ARM_ANGLE = new TransformNode(username + ".right_arm", scene);
        this.ARM_ANGLE.position = new Vector3(0, 0, 0);
        this.ARM_ANGLE.position = position;
        this.movement.position = new Vector3(0, 0, 0);
        this.movement.position = position;
        this.NEXT_POSITION = new Vector3(0, 0, 0);
        this.PREVIOUS_POSITION = new Vector3(0, 0, 0);

        //Import the body into the scene
        this.scene = scene;
        SceneLoader.ImportMesh("body", "", "./assets/player2.glb", this.scene, (meshes) => {

            if (meshes.length > 0) {

                //Import the body mesh
                console.log(meshes);
                this.model = meshes[0];
                this.model.name = "member";
                this.model.parent = this.movement;
                // if (creepy) {
                //     var NEW_MAT = new StandardMaterial("body_map", scene);
                //     NEW_MAT.diffuseTexture = new Texture("./assets/skins/skin1.png", scene);
                //     // meshes[5].material = NEW_MAT;
                //     meshes[5].material.albedoTexture = NEW_MAT.diffuseTexture;
                // }
                //Set everything to be uninteractable
                meshes.forEach(mesh => {
                    mesh.isPickable = false;
                    mesh.enablePointerMoveEvents = false;
                });

                //Initialize the left arm
                // meshes[2].position._x += .9;
                meshes[2].parent = this.ARM_ANGLE;
                this.LEFT_ARM = meshes[2];
                this.LEFT_ARM.setEnabled(false);

                //Initialize the right arm
                // meshes[4].position._x -= .9;
                meshes[4].parent = this.ARM_ANGLE;
                this.RIGHT_ARM = meshes[4];
                this.RIGHT_ARM.setEnabled(false);

                //Initialize the arms parent
                this.ARM_ANGLE.position = this.movement.position.clone();
                console.log(this.model);

                //Add the code to for updating the arms and grabbed items
                scene.registerBeforeRender(() => {
                    this.render();
                });
            }
        });


    }

    /*Lerp update for members*/
    render() {
        const delta = this.scene.getEngine().getDeltaTime() / 1000;
        const interpolationFactor = Math.min(0.5, delta * 60);
        Vector3.LerpToRef(this.movement.position, this.NEXT_POSITION, interpolationFactor, this.movement.position);
        // if (this.right_hand) {
        //     this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
        // }
        this.ARM_ANGLE.position = this.movement.position.clone();
    }

    updatePosition(position, rotation) {
        // console.log(rotation);
        this.PREVIOUS_POSITION = this.NEXT_POSITION.clone();
        this.movement.position = this.PREVIOUS_POSITION.clone();
        this.NEXT_POSITION = new Vector3(position._x, position._y, position._z);
        this.movement.rotation = new Vector3(0, rotation._y, 0);
        this.ARM_ANGLE.rotation = new Vector3(rotation._x, rotation._y, rotation._z);
    }
    updatePosition2(position, rotation) {
        console.log(position);
        this.movement.position = new Vector3(position._x, position._y, position._z);
        if (this.right_hand) {
            // this.right_hand.parent.parent.position = this.movement.position;
            this.right_hand.metadata.classInstance.body.transformNode.position.set(this.movement.position.x, this.movement.position.y, this.movement.position.z);
        }
        this.movement.rotation = new Vector3(0, rotation._y, 0);
    }

    arm_extend(right) {
        // console.log(right);
        // if (right && this.RIGHT_ARM != null) {
        //     this.RIGHT_ARM.setEnabled(true);

        // } else if (!right && this.LEFT_ARM != null) {
        //     this.LEFT_ARM.setEnabled(true); //Show left arm for debug right now
        // }
        if (right && !this.RIGHT_ARM.isEnabled(false)) {
            this.RIGHT_ARM.setEnabled(true);
        } else if (!right && !this.LEFT_ARM.isEnabled(false)) {
            this.LEFT_ARM.setEnabled(true);
        }
    }

    arm_retract(right) {
        // if (right && this.RIGHT_ARM != null) {
        //     this.RIGHT_ARM.setEnabled(false);

        // } else if (!right && this.LEFT_ARM != null) {
        //     this.LEFT_ARM.setEnabled(false);
        // }
        if (right && this.RIGHT_ARM.isEnabled(false)) {
            this.RIGHT_ARM.setEnabled(false);
        } else if (!right && this.LEFT_ARM.isEnabled(false)) {
            this.LEFT_ARM.setEnabled(false);
        }
    }

    updateGrab(item) {
        if (item) {
            item.metadata.classInstance.body.disablePreStep = false;
            // item.metadata.classInstance.body.motionType = PhysicsMotionType.STATIC;
        }
        this.right_hand = item;
    }

    addGrab(item, right) {
        let mesh = this.scene.getMeshByName(item);
        if (mesh) {
            mesh.metadata.classInstance.body.disablePreStep = false;
            mesh.metadata.classInstance.body.setMotionType(PhysicsMotionType.STATIC);
            mesh.metadata.classInstance.body.transformNode.position = (right) ? this.RIGHT_ARM.position.clone() : this.LEFT_ARM.position.clone();
            mesh.metadata.classInstance.body.transformNode.position.z += 1;
            mesh.metadata.classInstance.body.transformNode.rotation = Vector3.Zero();
            mesh.metadata.classInstance.body.transformNode.parent = this.ARM_ANGLE;
            if (right) {
                this.right_hand = mesh;
            } else {
                this.left_hand = mesh;
            }
            console.log("arm: %s", this.RIGHT_ARM.getAbsolutePosition());
        }
    }

    removeGrab(right) {
        let mesh = (right) ? this.right_hand : this.left_hand;
        if (mesh) {
            mesh.metadata.classInstance.body.disablePreStep = true;
            mesh.metadata.classInstance.body.setMotionType(PhysicsMotionType.DYNAMIC);
            mesh.metadata.classInstance.body.transformNode.parent = "";
            console.log("%s: %s", mesh.name, mesh.metadata.classInstance.model.getAbsolutePosition());
            mesh = "";
            this.arm_retract(right);
        }
    }
}