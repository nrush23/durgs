import { PhysicsAggregate, PhysicsShapeType, PhysicsBody, PhysicsMotionType, PhysicsShapeMesh } from "@babylonjs/core";

export class Fryer{
    Fryer;
    Left_Oil;
    Right_Oil;
    Items;

    constructor(scene){
        this.Items = [];
        this.Right_Oil = new PhysicsAggregate(scene.getMeshByName("right_oil"), PhysicsShapeType.BOX, {mass: 0}, scene);
        this.Fryer = scene.getMeshByName("fryer");
        var shape = new PhysicsShapeMesh(this.Fryer, scene);
        this.Fryer.body = new PhysicsBody(this.Fryer, PhysicsMotionType.STATIC, false, scene);
        this.Fryer.body.shape = shape;
    }
}