import { Vector3, HavokPlugin, NullEngine, Scene, MeshBuilder, TransformNode, PhysicsShapeBox, PhysicsMotionType, PhysicsBody, Quaternion, UniversalCamera } from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';
import fs from 'fs';
import path from 'path';
import { World } from './world.js';
import { Restock_Manager } from './restock_manager.js';

export class Game {
    scene;
    engine;
    camera;
    players;
    world;
    restock_manager;

    constructor() {
        // this.engine = new NullEngine();
        // this.scene = new Scene(this.engine);
        this.players = new Map();
    }

    addPlayer(player) {
        this.players.set(player.PID, player);
        player.joinGame(this.scene);
        console.log("Player%s added: %s", player.PID, this.players);
    }

    removePlayer(PID) {
        console.log("Game Players %s", this.players);
        if (this.players.has(PID)) {
            this.players.delete(PID);
            console.log("Player%s removed: %s", PID, this.players);
        }
    }

    async initializeScene() {
        this.engine = new NullEngine();
        this.scene = new Scene(this.engine);
        this.camera = new UniversalCamera("cam", new Vector3(0, 0, 0), this.scene);
        const __dirname = "./";
        const wasm = path.join(__dirname, 'node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
        let binary = fs.readFileSync(wasm);
        HavokPhysics({ wasmBinary: binary }).then((hk) => {
            const havokPlugin = new HavokPlugin(true, hk);
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
            this.world = new World(this.scene, () => {
                this.restock_manager = new Restock_Manager(this.scene);
            });

            let startTime = performance.now();
            let accumulator = 0;
            let simulationSpeedFactor = 1;
            const FIXED_TIME = 0.02;
            this.scene.registerBeforeRender(() => {
                const now = performance.now();
                const delta = (now - startTime) / 1000;
                startTime = now;
                accumulator += delta;
                while (accumulator >= FIXED_TIME) {
                    for (let player of this.players.values()) {
                        if (player.INPUT_BUFFER.length > 0) {
                            player.INPUT_BUFFER.forEach((input) => {
                                player.render2(input);
                                console.log(player.movement.position);
                            })
                            this.broadcast(JSON.stringify({
                                timestamp: Date.now(),
                                type: "member_movement",
                                username: player.username,
                                position: player.movement.position,
                                rotation: player.movement.rotation
                            }));
                            player.socket.send(JSON.stringify({
                                timestamp: Date.now(),
                                type: "movement",
                                position: player.movement.position,
                                index: player.INPUT_BUFFER[player.INPUT_BUFFER.length - 1][3]
                            }));
                            player.INPUT_BUFFER = [];
                        }
                    }
                    // for (let player of this.players.values()) {
                    //     if (player.NETWORK_CACHE.length > 0) {
                    //         player.NETWORK_CACHE.forEach(([pos, rot]) => {
                    //             player.render(pos, rot);
                    //         });
                    //         this.broadcast(JSON.stringify({
                    //             timestamp: Date.now(),
                    //             type: "member_movement",
                    //             username: player.username,
                    //             position: player.movement.position,
                    //             rotation: player.movement.rotation
                    //         }));
                    //         player.NETWORK_CACHE = [];
                    //     }
                    // }
                    accumulator -= FIXED_TIME;
                }
            });

            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        });
    }

    broadcast(msg) {
        for (let player of this.players.values()) {
            player.socket.send(msg);
        }
    }

    test_havok() {
        var test_box = new MeshBuilder.CreateBox("test_box", { size: 2 }, this.scene);
        var root = new TransformNode("box_root", this.scene);
        test_box.parent = root;
        root.position = new Vector3(0, 10, 0);

        //Adding physics to box
        const { min, max } = root.getHierarchyBoundingVectors();
        const size = max.subtract(min);
        const center = min.add(max).scale(0.5);
        const shape = new PhysicsShapeBox(new Vector3(center.x, center.y, center.z), Quaternion.Identity(), size, this.scene);
        let body = new PhysicsBody(root, PhysicsMotionType.DYNAMIC, false, this.scene);
        body.shape = shape;
        body.setMassProperties({ mass: 1 });
        this.scene.registerBeforeRender(() => {
            console.log(root.position.y);
        })
    }
}