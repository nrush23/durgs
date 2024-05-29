import { Axis, Color3, Mesh, MeshBuilder, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Bun } from "./bun";
export class World{
    DURGS;
    GROUND;
    scene;
    env;
    constructor(scene){
        this.scene = scene;
        SceneLoader.ImportMesh("", "", "./assets/restaurant_furnishing.glb", scene, (meshes) => {
            meshes.forEach(mesh =>{
                mesh.isPickable = false;
                mesh.enablePointerMoveEvents = false;
            });
            this.DURGS = meshes[0];
            this.DURGS.name = "restaurant";
        });
        new Bun(scene, true, new Vector3(0,1,0));
    }
}