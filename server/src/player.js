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
        // SceneLoader.ImportMeshAsync("body", "http://localhost:3001/assets/", "player.glb", this.scene, (meshes) => {
        //     console.log(meshes);
        //     if (meshes.length > 0) {
        //         this.model = meshes[0];
        //         this.model.name = this.username;
        //         this.movement = new TransformNode(this.PID, this.scene);
        //         this.movement.position = new Vector3(0, 0, 0);
        //         // console.log(this.model);
        //     }

        //     // this.scene.registerBeforeRender(() => {
        //     //     if (this.moved) {
        //     //         this.updatePosition(this.moved);
        //     //     }
        //     // });
        // }).then((evt) => {
        //     console.log("%s entered the scene", this.username);
        // });
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

    updatePosition(pos, rot) {
        // if (this.model) {
            // console.log(pos);
            // this.previous_position = this.movement.position;
            // this.movement.position = new Vector3(pos._x, pos._y, pos._z);
            // console.log("%s: <%s,%s,%s>", this.username, this.movement.position.x, this.movement.position.y, this.movement.position.z);
            this.NETWORK_CACHE.push([pos, rot]);
        // }
    }
}