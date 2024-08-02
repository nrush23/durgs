import { Vector3, PhysicsBody, PhysicsShapeBox, Quaternion, PhysicsMotionType, PhysicsShapeType, PhysicsAggregate, PhysicsShapeMesh } from "@babylonjs/core";
export class Grill {
    Grill_Top;
    Items;
    scene;
    Grill;
    constructor(scene){
        // this.Grill_Top = scene.getMeshByName("grill_top");
        this.scene = scene;
        this.Items = [];

        this.Grill_Top = new PhysicsAggregate(scene.getMeshByName("grill_top"), PhysicsShapeType.BOX, {mass: 0}, scene);
        this.Grill = scene.getMeshByName("grill");
        var grill_shape = new PhysicsShapeMesh(this.Grill, scene);
        this.Grill.body = new PhysicsBody(this.Grill, PhysicsMotionType.STATIC, false, scene);
        this.Grill.body.shape = grill_shape;
        
    }
}