import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, PointerEventTypes, StandardMaterial, Color3, MeshBuilder, Mesh, Axis, Space, CSG, Color4, FollowCamera, ExecuteCodeAction, UniversalCamera } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { World } from "./world"
import { Player } from "./player"
class App {

    WORLD;
    PLAYER;
    SOCKET;
    scene;
    moved = false;
    camera;
    canvas;
    engine;
    constructor() {
        //Initialize this.canvas and attach to webpage
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "canvas";
        document.body.appendChild(this.canvas);

        //Initialize babylon scene, this.engine, camera, and lighting
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.scene.getEngine().setHardwareScalingLevel(0.5);

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.engine.resize();
        });

        this.camera = new UniversalCamera("camera", new Vector3(0, 1, 0), this.scene);
        this.camera.attachControl(this.canvas, true);

        var SUN = new HemisphericLight("SUN", new Vector3(0, 3, 0), this.scene);
        this.WORLD = new World(this.scene);
        this.PLAYER = new Player(this.scene, this.camera);
        //Connect to server
        this.connect(this.scene);
        
        /*TODO: set up lock pointer camera movement, grabbing items, finish movement*/

        //Mouse Pointer Lock

        var isLocked = false;  // Start without being locked

        // On click event, request pointer lock
        this.scene.onPointerDown = function (evt) {
            //true/false check if we're locked, faster than checking pointerlock on each single click.
            if (!isLocked) {
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
                //camera.detachControl(canvas);
                isLocked = false;
            } else {
                //camera.attachControl(canvas);
                isLocked = true;
            }
        };

        // Attach events to the document
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        this.scene.clearColor = Color4.FromHexString("#c7f2f8");
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    connect(scene) {
        this.SOCKET = new WebSocket('ws://localhost:3001');
        this.SOCKET.addEventListener('open', (event) => {
            this.SOCKET.send(JSON.stringify({
                type: "join",
                timestamp: Date.now()
            }));
        });

        this.SOCKET.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log('Message received: %s', event.data);
            switch (data.type) {
                case "join":
                    this.PLAYER.PID = data.PID;
                    this.PLAYER.username = data.username;
                    this.PLAYER.createBody(scene);
                    // this.camera.setPosition(this.PLAYER.model.position);
                    // window.addEventListener('keydown', (event) => {
                    //     let x = 0;
                    //     let z = 0;
                    //     if (event.key == 'w' || event.key == 'ArrowUp') {
                    //         z += .1;
                    //     }
                    //     if (event.key == 's' || event.key == 'ArrowDown') {
                    //         z -= .1;
                    //     }
                    //     if (event.key == 'a' || event.key == 'ArrowLeft') {
                    //         x -= .1;
                    //     }
                    //     if (event.key == 'd' || event.key == "ArrowRight") {
                    //         x += .1;
                    //     }

                    //     if (x != 0 || z != 0) {
                    //         this.moved = true;
                    //         // this.PLAYER.updatePosition(x, 0, z);
                    //         // // this.camera.setPosition(this.PLAYER.model.position);
                    //     }
                    // });
                    // this.scene.registerBeforeRender(() => {
                    //     if (this.moved) {
                    //         this.moved = false;
                    //         this.SOCKET.send(JSON.stringify({
                    //             type: 'movement',
                    //             position: this.PLAYER.model.position
                    //         }));
                    //     }
                    // });
                    break;
                default:
                    console.log('Unknown type: %s', data.type);
            }
        });
    }
}

new App();