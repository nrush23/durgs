import { Vector3, HavokPlugin, NullEngine, Scene, MeshBuilder, TransformNode, PhysicsShapeBox, PhysicsMotionType, PhysicsBody, Quaternion, UniversalCamera } from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';
import fs from 'fs';
import path from 'path';

export class Game {
    scene;
    engine;
    camera;
    players;
    constructor() {
        // this.engine = new NullEngine();
        // this.scene = new Scene(this.engine);
        this.players = new Map();
    }

    addPlayer(player) {
        this.players.set(player.PID, player);
    }

    removePlayer(player) {
        if (this.players.has(player.PID)) {
            this.players.delete(player.PID);
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
            //initialize physics plugin, NullEngine, etc
            const havokPlugin = new HavokPlugin(true, hk);
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);



            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        });
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