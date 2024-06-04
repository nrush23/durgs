import { Axis, Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Bun } from "./bun";
import { Restocker } from "./restocker";
export class World {
    DURGS;
    GROUND;
    scene;
    env;

    //Need to finsih modifying how the world imports the restock icons
    constructor(scene, callback) {
        this.scene = scene;
        SceneLoader.ImportMeshAsync("", "./", "./assets/restaurant_furnishing1.glb", scene).then((result) => {
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
        var bun = new Bun(scene, true, new Vector3(0, 1, 0), "test_bun");
        // var bunAggregate = new PhysicsAggregate(bun.model, PhysicsShapeType.BOX, {mass: 1}, scene);
    }
}