import { PhysicsAggregate, PhysicsShapeType, SceneLoader, Vector3 } from "@babylonjs/core";
import { Bun } from "./functionality/bun.js";
import { Grill } from "./functionality/grill.js";
import { Fryer } from "./functionality/fryer.js";
// import { Restocker } from "./restocker";

//global.XMLHttpRequest =  require("xhr2").XMLHttpRequest;
export class World {
    DURGS;
    GROUND;
    scene;
    env;
    GRILL;
    FRYER;
    GAME;
    //Need to finsih modifying how the world imports the restock icons
    constructor(scene, callback, game) {
        this.scene = scene;
        this.GAME = game;
        var ignore = ["grill", "grill_top", "fryer", "right_oil", "ground"];
        SceneLoader.ImportMeshAsync("", "http://localhost:3001/assets/", "restaurant_furnishing4.glb", scene).then((result) => {
            const meshes = result.meshes;
            meshes.forEach((mesh) => {
                mesh.isPickable = false;
                mesh.enablePointerMoveEvents = false;
                if(!ignore.includes(mesh.name)){
                    new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0 }, scene);
                }
            });
            this.DURGS = meshes[0];
            this.DURGS.name = "restaurant";
            this.GROUND = new PhysicsAggregate(scene.getMeshByName("ground"), PhysicsShapeType.BOX, {mass: 0}, scene);
            this.GRILL = new Grill(scene, game);
            this.FRYER = new Fryer(scene);
            if(typeof callback == 'function'){
                callback();
            }
            // new Restocker(scene);
        }).catch((error) => {
            console.log("Loading mesh error: ", error);
        });
        var bun = new Bun(scene, true, new Vector3(0,1,0), "test_bun");
    }
}