import { Axis, Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Bun } from "./bun";
import { Restocker } from "./restocker";
import { Grill } from "./grill";
import { Fryer } from "./fryer";
import { Tray } from "./tray";
export class World {
    DURGS;
    GROUND;
    GRILL;
    scene;
    env;
    FRYER;
    //Need to finsih modifying how the world imports the restock icons
    constructor(scene, callback) {
        this.scene = scene;
        var names = ["grill", "grill_top", "fryer", "right_oil", "ground"];
        SceneLoader.ImportMeshAsync("", "./", "./assets/server_world.glb", scene).then((result) => {
            const meshes = result.meshes;
            meshes.forEach((mesh) => {
                mesh.isPickable = false;
                mesh.enablePointerMoveEvents = false;
                if (!names.includes(mesh.name)) {
                    new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0 }, scene);
                }
            });
            this.DURGS = meshes[0];
            this.DURGS.name = "restaurant";
            this.GROUND = new PhysicsAggregate(scene.getMeshByName("ground"), PhysicsShapeType.BOX, { mass: 0 }, scene);
            if (typeof callback == 'function') {
                callback();
            }
            this.GRILL = new Grill(scene);
            this.FRYER = new Fryer(scene);
            // new Restocker(scene);
        }).catch((error) => {
            console.log("Loading mesh error: ", error);
        });
        var bun = new Bun(scene, true, new Vector3(0, 1, 0), "test_bun");
        var tray = new Tray(scene);
    }
}