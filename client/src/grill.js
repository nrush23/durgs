import { Vector3, PhysicsBody, PhysicsShapeBox, Quaternion, PhysicsMotionType, PhysicsShapeType, PhysicsAggregate } from "@babylonjs/core";
export class Grill {
    Grill_Top;
    Items;
    scene;
    body;
    constructor(scene){
        // this.Grill_Top = scene.getMeshByName("grill_top");
        this.scene = scene;
        this.Items = [];

        this.Grill_Top = new PhysicsAggregate(scene.getMeshByName("grill_top"), PhysicsShapeType.BOX, {mass: 0}, scene);
        
        //Physics body
        // const {min, max} = this.Grill_Top.getHierarchyBoundingVectors();
        // const size = max.subtract(min);
        // const center = min.add(max).scale(0.5);
        // const shape = new PhysicsShapeBox(new Vector3(center.x, center.y, center.z), Quaternion.Identity(), size, scene);
        // this.body = new PhysicsBody(this.Grill_Top, PhysicsMotionType.STATIC, false, scene);
        // this.body.shape = shape;
        // this.body.setMassProperties({mass: 0});
        // console.log(this.Grill_Top);
    }
}