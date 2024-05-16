import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, PointerEventTypes, StandardMaterial, Color3, MeshBuilder, Mesh, Axis, Space, CSG, Color4 } from "@babylonjs/core";  
import * as GUI from "@babylonjs/gui";
import { World } from "./world"
import { Player } from "./player"
class App {

    WORLD: World;
    PLAYER: Player;
    constructor(){

        //Initialize canvas and attach to webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "CANVAS";
        document.body.appendChild(canvas);

        //Initialize babylon scene, engine, camera, and lighting
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);
        var camera: ArcRotateCamera = new ArcRotateCamera("CAMERA", -Math.PI/2, Math.PI/2, 8, new Vector3(0,7/8,0), scene);
        camera.attachControl(canvas, true);
        var SUN: HemisphericLight = new HemisphericLight("SUN", new Vector3(0,3,0), scene);
        
        /*TODO: Create start menu, websocket connection between client and server, test playground for dummy models */

        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}

new App();