import { Vector3, PhysicsBody, PhysicsShapeBox, Quaternion, PhysicsMotionType, PhysicsShapeType, PhysicsAggregate, PhysicsShapeMesh, Sound } from "@babylonjs/core";
export class Grill {
    Grill_Top;
    Items;
    scene;
    Grill;

    sizzle;
    constructor(scene) {
        // this.Grill_Top = scene.getMeshByName("grill_top");
        this.scene = scene;
        this.Items = [];

        this.Grill_Top = scene.getMeshByName("grill_top");
        var top_shape = new PhysicsShapeMesh(this.Grill_Top, scene);
        this.Grill_Top.body = new PhysicsBody(this.Grill_Top, PhysicsMotionType.STATIC, false, scene);
        this.Grill_Top.body.shape = top_shape;
        this.Grill = scene.getMeshByName("grill");
        var grill_shape = new PhysicsShapeMesh(this.Grill, scene);
        this.Grill.body = new PhysicsBody(this.Grill, PhysicsMotionType.STATIC, false, scene);
        this.Grill.body.shape = grill_shape;
        this.sizzle = new Sound("sizzle", "./assets/music/sizzle_sizzle.mp3", this.scene, null, { loop: true, spatialSound: true });
        this.sizzle.setVolume(.5);
        this.sizzle.attachToMesh(this.Grill_Top);

    }

    enableSizzle(play) {
        if (play) {
            this.sizzle.play();
        } else {
            this.sizzle.stop();
        }
    }
}