import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, PhysicsViewer, PointLight, Scene, ArcRotateCamera, Vector3, HemisphericLight, PointerEventTypes, StandardMaterial, Color3, MeshBuilder, Mesh, Axis, Space, CSG, Color4, FollowCamera, ExecuteCodeAction, UniversalCamera, HavokPlugin } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import * as GUI from "@babylonjs/gui";
import { World } from "./world"
import { Player } from "./player"
import { Member } from "./member";
import { Restocker } from "./restocker";
class App {

    WORLD;
    PLAYER;
    SOCKET;
    RESTOCKER;
    scene;
    moved = false;
    camera;
    canvas;
    engine;
    LOG = false;

    Members;
    constructor() {

    }

    async initializePhysics() {
        const hk = await HavokPhysics();
        const havokPlugin = new HavokPlugin(true, hk);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
        this.scene.hk = havokPlugin;
    }


    //Address in WebSocket is url to connect to
    //Create new player and wait for join message to get username
    //and player id (pid)
    connect() {
        console.log("Trying to connect");
        this.SOCKET = new WebSocket('ws://192.168.0.11:3001/');
        // this.SOCKET = new WebSocket('ws://localhost:3001');
        // this.PLAYER = new Player(this.scene, this.camera, this.SOCKET);
        this.SOCKET.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            // console.log('Message received: %s', event.data);
            switch (data.type) {
                case "join":
                    this.PLAYER = new Player(this.scene, this.camera, this.SOCKET);
                    this.PLAYER.PID = data.PID;
                    this.PLAYER.username = data.username;
                    this.PLAYER.createBody(this.scene, data.texture);
                    this.START();
                    break;
                case "new_member":
                    console.log(data);
                    if (!this.Members.has(data.username)) {
                        var position = new Vector3(data.position.x, data.position.y, data.position.z);
                        var member = new Member(data.username, this.scene, position, data.texture);
                        this.Members.set(member.username, member);
                    }
                    break;
                case "member_movement":
                    if (this.Members.has(data.username)) {
                        this.Members.get(data.username).updatePosition(data.position, data.rotation);
                    }
                    break;
                case "delete":
                    if (this.Members.has(data.username)) {
                        this.scene.removeMesh(this.Members.get(data.username).movement, true);
                        this.Members.delete(data.username);
                    }
                    break;
                case "arm_update":
                    if (this.Members.has(data.username)) {
                        let member = this.Members.get(data.username);
                        member.arm_extend(data.arm);
                    }
                    break;
                case "arm_retract":
                    if (this.Members.has(data.username)) {
                        let member = this.Members.get(data.username);
                        member.arm_retract(data.arm);
                    }
                    break;
                case "grabbed":
                    // var item = this.scene.getMeshByName(data.item);
                    // // item.metadata.classInstance.body.physicsImposter.disable();
                    // // console.log(data);
                    // // console.log(item.metadata.classInstance.body);
                    // item.metadata.classInstance.body.disablePreStep = false;
                    // // this.PLAYER.right_hand = item.parent.parent;
                    // this.PLAYER.right_hand = item;
                    this.PLAYER.addGrab(data.item);
                    break;
                case "released":
                    // if (this.PLAYER.right_hand) {
                    //     this.PLAYER.right_hand.metadata.classInstance.body.disablePreStep = true;
                    //     this.PLAYER.right_hand = "";
                    // }
                    this.PLAYER.removeGrab();
                    break;
                case "member_grabbed":
                    console.log('Message received: %s', event.data);
                    if (this.Members.has(data.username)) {
                        var member = this.Members.get(data.username);
                        // var item = this.scene.getMeshByName(data.item);
                        // member.updateGrab(item);
                        member.addGrab(data.item, true);
                    }
                    break;
                case "member_released":
                    console.log('Message received: %s', event.data);
                    if (this.Members.has(data.username)) {
                        var member = this.Members.get(data.username);
                        // // member.right_hand.position.y = 0;
                        // // console.log(member);
                        // member.right_hand.metadata.classInstance.body.disablePreStep = true;
                        // member.updateGrab("");
                        member.removeGrab(true);
                    }
                    break;
                case "spawn_response":
                    console.log('Message received: %s', event.data);
                    this.RESTOCKER.platform.spawnIngredient(data.item, data.pool);
                    break;
                case "update_mesh":
                    console.log('Message received: %s', event.data);
                    break;
                case "movement_cache":
                    if (data.cache.length > 0) {
                        console.log(data);
                    }
                    break;
                case "movement":
                    if (this.LOG) {
                        console.log("MOVEMENT MSG: %s", event.data);
                    }
                    this.PLAYER.UPDATE_CACHE = () => this.PLAYER.removeFromCache(new Vector3(data.position._x, data.position._y, data.position._z), data.index);
                    break;
                default:
                    console.log('Unknown type: %s', data.type);
            }
        });
        this.SOCKET.addEventListener('open', (event) => {
            this.SOCKET.send(JSON.stringify({
                type: "join",
                timestamp: Date.now()
            }));
        });
    }

    START() {
        if (this.PLAYER != null && this.PLAYER.RIGHT_ARM != null && this.PLAYER.RIGHT_ARM.body) {
            this.scene.clearColor = Color4.FromHexString("#c7f2f8");
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            let startTime = performance.now();
            let simulationSpeedFactor = 1;
            let accumulator = 0;
            let FIXED_TIME = 0.02;
            this.scene.registerBeforeRender(() => {
                const now = performance.now();
                const delta = (now - startTime) / 1000;
                startTime = now;
                accumulator += delta;

                while (accumulator >= FIXED_TIME * simulationSpeedFactor) {
                    this.PLAYER.updateInteract();
                    this.PLAYER.sendPosition();
                    this.Members.forEach((member) => {
                        // if (member.movement) {
                        member.render();
                        // }
                    });
                    accumulator -= FIXED_TIME;
                }
            })

            let viewer = new PhysicsViewer(this.scene);
            for (let mesh of this.scene.meshes) {
                if (mesh.physicsBody) {
                    viewer.showBody(mesh.physicsBody);
                }
            }
            this.scene.debugLayer.show();
        } else {
            setTimeout(() => {
                this.START();
            }, 200);
        }
    }
    async RUN() {
        //Initialize this.canvas and attach to webpage
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "canvas";
        document.body.appendChild(this.canvas);

        //Initialize babylon scene, this.engine, camera, and lighting
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.scene.locked = false;
        this.scene.getEngine().setHardwareScalingLevel(0.5);
        this.Members = new Map();

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.engine.resize();
        });

        this.camera = new UniversalCamera("camera", new Vector3(0, 0, 0), this.scene);
        this.camera.attachControl(this.canvas, true);

        var SUN = new HemisphericLight("SUN", new Vector3(0, 3, 0), this.scene);
        await this.initializePhysics();
        this.WORLD = new World(this.scene, () => {
            this.RESTOCKER = new Restocker(this.scene);
        });
        //Connect to server and start game
        this.connect();

    }

    async RUN2() {
        //Initialize this.canvas and attach to webpage
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "canvas";
        document.body.appendChild(this.canvas);

        //Initialize babylon scene, this.engine, camera, and lighting
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.scene.locked = false;
        this.scene.getEngine().setHardwareScalingLevel(0.5);
        this.Members = new Map();

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.engine.resize();
        });

        this.camera = new UniversalCamera("camera", new Vector3(0, 0, 0), this.scene);
        this.camera.attachControl(this.canvas, true);

        var SUN = new HemisphericLight("SUN", new Vector3(0, 3, 0), this.scene);
        this.initializePhysics().then(() => {
            this.WORLD = new World(this.scene, () => {
                this.RESTOCKER = new Restocker(this.scene);
            });

        });
        //Connect to server
        this.connect();
        this.scene.clearColor = Color4.FromHexString("#c7f2f8");
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        let startTime = performance.now();
        let simulationSpeedFactor = 1;
        let accumulator = 0;
        let FIXED_TIME = 0.02;
        this.scene.registerBeforeRender(() => {
            const now = performance.now();
            const delta = (now - startTime) / 1000;
            startTime = now;
            accumulator += delta;

            while (accumulator >= FIXED_TIME * simulationSpeedFactor) {
                this.PLAYER.updateInteract();
                // this.PLAYER.sendPosition();
                // this.Members.forEach((member) => {
                //     member.render();
                // });
                accumulator -= FIXED_TIME;
            }
        })

        this.scene.debugLayer.show();
    }
}

let GAME = new App();
GAME.RUN();
