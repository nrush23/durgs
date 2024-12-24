import { Ball } from "./ball";
import { GlowLayer, Color3 } from "@babylonjs/core";
export class Xmas_Tree {
    balls = [];
    scene;
    constructor(scene) {
        this.scene = scene;
        this.balls = scene.meshes.filter(mesh => mesh.name.startsWith("ball"));
        console.log(this.balls);
        // const ball = new Ball(scene, 0, this.balls[0]);
        const glowLayer = new GlowLayer("glow", scene); 
        glowLayer.intensity = 0.8;
        for (let i = 0; i < this.balls.length; i++) {
            if (this.balls[i]) {
                new Ball(scene, i + 1, this.balls[i], true);
            }
        }
        const star = scene.getMeshByName("star");
        star.material.emissiveColor = Color3.FromHexString("#4D4216");
        star.material.emissiveIntensity = 0.5;
        console.log(star);
    }
}