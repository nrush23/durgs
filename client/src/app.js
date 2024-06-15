import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, PointLight, Scene, ArcRotateCamera, Vector3, HemisphericLight, PointerEventTypes, StandardMaterial, Color3, MeshBuilder, Mesh, Axis, Space, CSG, Color4, FollowCamera, ExecuteCodeAction, UniversalCamera, HavokPlugin } from "@babylonjs/core";
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

    Members;
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
        this.connect(this.scene);

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
                    member.render();
                });
                accumulator -= FIXED_TIME;
            }
        })

        this.scene.debugLayer.show();
    }

    async initializePhysics() {
        const hk = await HavokPhysics();
        const havokPlugin = new HavokPlugin(true, hk);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
    }

    //Address in WebSocket is url to connect to
    //Create new player and wait for join message to get username
    //and player id (pid)
    connect(scene) {
        this.SOCKET = new WebSocket('ws://192.168.0.45:3001');
        this.PLAYER = new Player(scene, this.camera, this.SOCKET);
        this.SOCKET.addEventListener('open', (event) => {
            this.SOCKET.send(JSON.stringify({
                type: "join",
                timestamp: Date.now()
            }));
        });

        this.SOCKET.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            // console.log('Message received: %s', event.data);
            switch (data.type) {
                case "join":
                    this.PLAYER.PID = data.PID;
                    this.PLAYER.username = data.username;
                    this.PLAYER.createBody(scene, data.texture);
                    break;
                case "new_member":
                    console.log(data);
                    if (!this.Members.has(data.username)) {
                        var position = new Vector3(data.position.x, data.position.y, data.position.z);
                        var member = new Member(data.username, scene, position, data.texture);
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
                    }
                    break;
                case "grabbed":
                    var item = scene.getMeshByName(data.item);
                    // console.log(data);
                    // console.log(item.metadata.classInstance.body);
                    item.metadata.classInstance.body.disablePreStep = false;
                    // this.PLAYER.right_hand = item.parent.parent;
                    this.PLAYER.right_hand = item;
                    break;
                case "released":
                    if (this.PLAYER.right_hand) {
                        this.PLAYER.right_hand.metadata.classInstance.body.disablePreStep = true;
                        this.PLAYER.right_hand = "";
                    }
                    break;
                case "member_grabbed":
                    console.log('Message received: %s', event.data);
                    if (this.Members.has(data.username)) {
                        var member = this.Members.get(data.username);
                        var item = scene.getMeshByName(data.item);
                        member.updateGrab(item);
                    }
                    break;
                case "member_released":
                    console.log('Message received: %s', event.data);
                    if (this.Members.has(data.username)) {
                        var member = this.Members.get(data.username);
                        // member.right_hand.position.y = 0;
                        // console.log(member);
                        member.right_hand.metadata.classInstance.body.disablePreStep = true;
                        member.updateGrab("");
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
                    console.log("MOVEMENT MSG: %s", event.data);
                    this.PLAYER.removeFromCache(new Vector3(data.position._x, data.position._y, data.position._z), data.index);
                    // this.PLAYER.INPUT_CACHE.pushback
                    // this.PLAYER.PREVIOUS_POSITION = this.PLAYER.NEXT_POSITION;
                    // this.PLAYER.NEXT_POSITION = new Vector3(data.position._x, data.position._y, data.position._z);
                    break;
                default:
                    console.log('Unknown type: %s', data.type);
            }
        });
    }
}

new App();