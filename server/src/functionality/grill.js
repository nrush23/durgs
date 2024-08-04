import { Vector3, PhysicsBody, PhysicsShapeBox, Quaternion, PhysicsMotionType, PhysicsShapeType, PhysicsAggregate, PhysicsShapeMesh, PhysicsEventType } from "@babylonjs/core";
export class Grill {
    Grill_Top;
    Items;
    scene;
    Grill;
    GAME;

    //Cooks timers fire every 2 and a half seconds
    COOK_TIMER = 2500;
    constructor(scene, game) {
        // this.Grill_Top = scene.getMeshByName("grill_top");
        this.scene = scene;
        this.GAME = game;
        this.Items = new Map();
        this.Grill_Top = scene.getMeshByName("grill_top");
        var top_shape = new PhysicsShapeMesh(this.Grill_Top, scene);
        this.Grill_Top.body = new PhysicsBody(this.Grill_Top, PhysicsMotionType.STATIC, false, scene);
        this.Grill_Top.body.shape = top_shape;
        this.Grill_Top.body.setCollisionCallbackEnabled(true);
        this.Grill_Top.body.getCollisionObservable().add((collision) => {
            if (collision.type === PhysicsEventType.COLLISION_STARTED) {
                // console.log("%s", collision.collidedAgainst.transformNode);
                if (!this.Items.has(collision.collidedAgainst.transformNode.name)) {
                    this.Items.set(collision.collidedAgainst.transformNode.name, collision.collidedAgainst.transformNode);
                    // this.Items.add(collision.collider.metadata.classInstance.model.name, collision.collider);
                    this.GAME.broadcast(JSON.stringify({
                        timestamp: Date.now(),
                        type: "sizzle",
                        item: collision.collidedAgainst.transformNode.name,
                        position: collision.collidedAgainst.transformNode.metadata.classInstance.model.position,
                    }));
                    console.log("COOKING %s", collision.collidedAgainst.transformNode.name);
                    setTimeout(() => { this.cookItem(collision.collidedAgainst.transformNode.name) }, this.COOK_TIMER);
                }
            }
        });
        this.Grill_Top.body.getCollisionEndedObservable().add((collision) => {
            console.log("ENDED %s", collision.collidedAgainst.transformNode.name);
            this.removeItem(collision.collidedAgainst.transformNode.name);
        })
        this.Grill = scene.getMeshByName("grill");
        var grill_shape = new PhysicsShapeMesh(this.Grill, scene);
        this.Grill.body = new PhysicsBody(this.Grill, PhysicsMotionType.STATIC, false, scene);
        this.Grill.body.shape = grill_shape;
    }

    removeItem(item) {
        if (this.Items.delete(item)) {
            this.GAME.broadcast(JSON.stringify({
                timestamp: Date.now(),
                type: "sizzle_end",
                item: item,
                play: (this.Items.size == 0)? false: true,
            }));
        };
    }

    cookItem(item) {
        var mesh = this.Items.get(item);
        if (mesh) {
            console.log("%s: %s", mesh.name, mesh.metadata.classInstance.cook_time);
            mesh.metadata.classInstance.cook();
            this.GAME.broadcast(JSON.stringify({
                timestamp: Date.now(),
                type: "cook",
                item: mesh.name,
                time: mesh.metadata.classInstance.cook_time,
                position: mesh.position,
            }))
            setTimeout(() => { this.cookItem(item) }, this.COOK_TIMER);
        }
    }
}