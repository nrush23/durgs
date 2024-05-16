import { Axis, Color3, Mesh, MeshBuilder, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
export class World{
    DURGS;
    GROUND;
    scene: Scene;
    env;
    constructor(scene){
        this.scene = scene;
        SceneLoader.ImportMesh("", "", "./assets/restaurant.glb", scene, function (meshes){
            if(meshes.length > 0){

            }
        });
    }
}