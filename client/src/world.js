import { Axis, Color3, Mesh, MeshBuilder, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Bun } from "./bun";
import { Restocker } from "./restocker";
export class World {
    DURGS;
    GROUND;
    scene;
    env;

    //Need to finsih modifying how the world imports the restock icons
    constructor(scene) {
        this.scene = scene;
        SceneLoader.ImportMeshAsync("", "./", "./assets/restaurant_furnishing1.glb", scene).then((result) => {
            const meshes = result.meshes;
            meshes.forEach((mesh) => {
                mesh.isPickable = false;
                mesh.enablePointerMoveEvents = false;
            });
            this.DURGS = meshes[0];
            this.DURGS.name = "restaurant";
            new Restocker(scene);
        }).catch((error) => {
            console.log("Loading mesh error: ", error);
        });
        // this.scene = scene;
        // SceneLoader.ImportMeshAsync("", "", "./assets/restaurant_furnishing1.glb", scene, (meshes) => {
        //     meshes.forEach(mesh => {
        //         mesh.isPickable = false;
        //         mesh.enablePointerMoveEvents = false;
        //     });
        //     this.DURGS = meshes[0];
        //     this.DURGS.name = "restaurant";
        // }).then((scene) => {
        //     new Restocker(scene);
        // });
        new Bun(scene, true, new Vector3(0, 1, 0));
    }
}