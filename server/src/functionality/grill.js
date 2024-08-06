import { Vector3, PhysicsBody, CreateBox, PhysicsShapeBox, Quaternion, PhysicsMotionType, PhysicsShapeType, PhysicsAggregate, PhysicsShapeMesh, PhysicsEventType } from "@babylonjs/core";
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
                console.log("%s", collision.collidedAgainst.transformNode.name);
                setTimeout(() => {
                    console.log("%s: %s", collision.collidedAgainst.transformNode.name, collision.collidedAgainst.transformNode.position);
                }, 500);
                // if (!this.Items.has(collision.collidedAgainst.transformNode.name)) {
                //     this.Items.set(collision.collidedAgainst.transformNode.name, collision.collidedAgainst.transformNode);
                //     // this.Items.add(collision.collider.metadata.classInstance.model.name, collision.collider);
                //     this.GAME.broadcast(JSON.stringify({
                //         timestamp: Date.now(),
                //         type: "sizzle",
                //         item: collision.collidedAgainst.transformNode.name,
                //         position: collision.collidedAgainst.transformNode.metadata.classInstance.model.position,
                //     }));
                //     console.log("COOKING %s", collision.collidedAgainst.transformNode.name);
                //     setTimeout(() => { this.cookItem(collision.collidedAgainst.transformNode.name) }, this.COOK_TIMER);
                // }
            }
        });
        this.Grill_Top.body.getCollisionEndedObservable().add((collision) => {
            console.log("ENDED %s", collision.collidedAgainst.transformNode.name);
            // this.removeItem(collision.collidedAgainst.transformNode.name);
        })

        
        // var test1 = new CreateBox("test1", {size: 0.5}, scene);
        // var test2 = new CreateBox("test2", {size: 0.5}, scene);
        // test1.position = this.Grill_Top.position.clone();
        // test1.position.y += 0.5;
        // test1.position.x -= 0.2

        // test2.position = this.Grill_Top.position.clone();
        // test2.position.y += 0.5;
        // test2.position.x += 0.2

        // test1.shape = new PhysicsShapeMesh(test1, scene);
        // test2.shape = new PhysicsShapeMesh(test2, scene);
        // test1.body = new PhysicsBody(test1, PhysicsMotionType.DYNAMIC, false, scene);
        // test2.body = new PhysicsBody(test2, PhysicsMotionType.DYNAMIC, false, scene);
        // test1.body.shape = test1.shape;
        // test2.body.shape = test2.shape;

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