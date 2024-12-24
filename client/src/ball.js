import { StandardMaterial, Color3, SubMesh, MultiMaterial, PointLight } from "@babylonjs/core";
export class Ball {
    scene;
    color;
    timer;
    OVERLAY; 
    model;
    light;
    Colors = [ Color3.FromHexString("#ff0000"), Color3.FromHexString("#01ff00"), Color3.FromHexString("#fcff00"), Color3.FromHexString("#2ceef5"), Color3.FromHexString("#ffffff")];
    // Colors = [Color3.FromHexString("#ff0000"), Color3.FromHexString("#01ff00"), Color3.FromHexString("#fcff00")];
    // Colors = [Color3.Red(), Color3.Yellow(), Color3.Green()];
    constructor(scene, id, mesh){
        this.scene = scene;
        this.color = Math.floor(Math.random() * 2) + 1;
        // this.timer = (Math.floor(Math.random()*10) + 3)*100;
        this.timer = this.getRandomTime();
        this.OVERLAY = new StandardMaterial("ball_" + id, scene);
        this.OVERLAY.emissiveColor = this.Colors[this.color];
        this.OVERLAY.diffuseColor = this.OVERLAY.emissiveColor;

        var verticesCount = mesh.getTotalVertices();
        var indicesCount = mesh.getTotalIndices()

        // Clear existing subMeshes
        mesh.subMeshes = [];

        // Define subMeshes
        new SubMesh(0, 0, verticesCount, 0, indicesCount, mesh);
        new SubMesh(1, 0, verticesCount, 0, indicesCount, mesh);

        // Create MultiMaterial
        var NEW_MAT = new MultiMaterial("ball_"+id, this.scene);
        NEW_MAT.subMaterials.push(mesh.material); // Original material
        NEW_MAT.subMaterials.push(this.OVERLAY); // Overlay material

        // Apply MultiMaterial to the mesh
        mesh.material = NEW_MAT;
        // this.light = new PointLight("light_" + id, mesh.position, scene);
        // this.light.diffuse = this.OVERLAY.diffuseColor;
        // this.light.intensity = 0.7
        setInterval(() => {
            this.color = (this.color+1) % 3;
            this.OVERLAY.emissiveColor = this.Colors[this.color];
            this.OVERLAY.diffuseColor = this.Colors[this.color];
            this.timer = this.getRandomTime();
        }, this.timer);
    }

    getRandomTime(){
        return (Math.floor(Math.random() * 5) + 2) * 1000;
    }
}