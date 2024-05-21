import { AbstractMesh, ArcRotateCamera, Mesh, Scene, SceneLoader, TransformNode, UniversalCamera, Vector3, double, int } from "@babylonjs/core";
import { PlayerInput } from "./inputController";

export class Player{
    PID;
    username;
    model = null;
    movement;
    scene;
    camera;
    cam_root;
    controller;
    ytilt;

     static  PLAYER_SPEED = 0.45;
     static  JUMP_FORCE = 0.80;
    static GRAVITY = -2.8;
    static ORIGINAL_TILT = new Vector3(0.5934119456780721, 0, 0);


    constructor(scene, camera){
        this.scene = scene;
        this.PID = -1;
        this.username = "null";
        this.model = new AbstractMesh("", this.scene);
        this.camera = camera;
        this.movement = new TransformNode("player", scene);
    }

    createBody(scene){
        this.scene = scene;
        SceneLoader.ImportMesh("", "", "./assets/player.glb", this.scene, (meshes) => {
            if(meshes.length > 0){
                this.model = meshes[0]; // Assign the first mesh to the class property
                this.model.position = new Vector3(0,1,0);
            }
        });
        this.controller = new PlayerInput(scene);
        scene.registerBeforeRender(()=>{
            this.updatePosition();
        });
    }

    updatePosition(){
        this.model.position.x += this.controller.horizontal;
        this.model.position.z += this.controller.vertical;
        // this.camera.setPosition(this.model.position);
        this.camera._position = this.model.position;
        this.model.rotation = this.movement.rotation;
    }

    initializeCamera(camera){
        // this.camera = camera;
        // this.camera.position = new Vector3(0,0,0);
        // this.ytilt = new TransformNode("ytilt");
        // this.ytilt.rotation = Player.ORIGINAL_TILT;
        this.cam_root = new TransformNode("root");
        this.cam_root.position = new Vector3(0, 0, 0); //initialized at (0,0,0)
        //to face the player from behind (180 degrees)
        this.cam_root.rotation = new Vector3(0, Math.PI, 0);

        //rotations along the x-axis (up/down tilting)
        let ytilt = new TransformNode("ytilt");
        //adjustments to camera view to point down at our player
        ytilt.rotation = Player.ORIGINAL_TILT;
        this.ytilt = ytilt;
        ytilt.parent = this.cam_root;

        //our actual camera that's pointing at our root's position
        this.camera = camera;
        this.camera.lockedTarget = this.cam_root.position;
        this.camera.fov = 0.47350045992678597;
        this.camera.parent = ytilt;

        // this.scene.activeCamera = this.camera;
    }
}