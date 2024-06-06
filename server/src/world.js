import { PhysicsAggregate, PhysicsShapeType, SceneLoader } from "@babylonjs/core";
// import { Bun } from "./bun";
// import { Restocker } from "./restocker";

//global.XMLHttpRequest =  require("xhr2").XMLHttpRequest;
export class World {
    DURGS;
    GROUND;
    scene;
    env;

    //Need to finsih modifying how the world imports the restock icons
    constructor(scene, callback) {
        this.scene = scene;
        SceneLoader.ImportMeshAsync("", "http://localhost:3001/assets/", "restaurant_furnishing1.glb", scene).then((result) => {
            const meshes = result.meshes;
            meshes.forEach((mesh) => {
                mesh.isPickable = false;
                mesh.enablePointerMoveEvents = false;
            });
            this.DURGS = meshes[0];
            this.DURGS.name = "restaurant";
            this.GROUND = new PhysicsAggregate(scene.getMeshByName("ground"), PhysicsShapeType.BOX, {mass: 0}, scene);
            if(typeof callback == 'function'){
                callback();
            }
            // new Restocker(scene);
        }).catch((error) => {
            console.log("Loading mesh error: ", error);
        });
    }
}