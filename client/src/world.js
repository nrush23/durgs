import { Axis, Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Bun } from "./bun";
import { Restocker } from "./restocker";
import { Grill } from "./grill";
export class World {
    DURGS;
    GROUND;
    GRILL;
    scene;
    env;

    //Need to finsih modifying how the world imports the restock icons
    constructor(scene, callback) {
        this.scene = scene;
        SceneLoader.ImportMeshAsync("", "./", "./assets/restaurant_furnishing2.glb", scene).then((result) => {
            const meshes = result.meshes;
            meshes.forEach((mesh) => {
                mesh.isPickable = false;
                mesh.enablePointerMoveEvents = false;
                new PhysicsAggregate(mesh, PhysicsShapeType.BOX, {mass:0}, scene);
            });
            this.DURGS = meshes[0];
            this.DURGS.name = "restaurant";
            this.GROUND = new PhysicsAggregate(scene.getMeshByName("ground"), PhysicsShapeType.BOX, {mass: 0}, scene);
            if(typeof callback == 'function'){
                callback();
            }
            this.GRILL = new Grill(scene);
            // new Restocker(scene);
        }).catch((error) => {
            console.log("Loading mesh error: ", error);
        });
        var bun = new Bun(scene, true, new Vector3(0, 1, 0), "test_bun");
    }
}