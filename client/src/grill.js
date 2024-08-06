import { Vector3, PhysicsBody, PhysicsEventType, PhysicsShapeBox, Quaternion, PhysicsMotionType, PhysicsShapeType, PhysicsAggregate, PhysicsShapeMesh, Sound } from "@babylonjs/core";
export class Grill {
    Grill_Top;
    Items;
    scene;
    Grill;

    //Cook updates every 2.5s
    COOK_TIMER = 2500;
    sizzle;
    constructor(scene) {
        // this.Grill_Top = scene.getMeshByName("grill_top");
        this.scene = scene;
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
            }
        });
        this.Grill_Top.body.getCollisionEndedObservable().add((collision) => {
            console.log("ENDED %s", collision.collidedAgainst.transformNode.name);
            setTimeout(()=>{
                console.log("%s: %s", collision.collidedAgainst.transformNode.name, collision.collidedAgainst.transformNode.position);
            }, 1000);
            // this.removeItem(collision.collidedAgainst.transformNode.name);
        })

        this.Grill = scene.getMeshByName("grill");
        var grill_shape = new PhysicsShapeMesh(this.Grill, scene);
        this.Grill.body = new PhysicsBody(this.Grill, PhysicsMotionType.STATIC, false, scene);
        this.Grill.body.shape = grill_shape;
        this.sizzle = new Sound("sizzle", "./assets/music/sizzle_sizzle.mp3", this.scene, null, { loop: true, spatialSound: true });
        this.sizzle.setVolume(.5);
        this.sizzle.attachToMesh(this.Grill_Top);

    }

    enableSizzle(play) {
        if (play && !this.sizzle.isPlaying) {
            this.sizzle.play(0);
        } else if (!play) {
            this.sizzle.stop(0);
        }
        console.log("%s: %s", play, this.sizzle.isPaused);
        // if(play && (this.sizzle.isReady || this.sizzle.isPaused)){
        //     this.sizzle.play();
        // }else if(!play && this.sizzle.isPlaying){
        //     this.sizzle.stop();
        //     console.log("stop playing");
        // }
        // console.log(play);
        // switch (play) {
        //     case true:
        //         if (this.sizzle.isReady || this.sizzle.isPaused) {
        //             this.sizzle.play();
        //         }
        //         break;
        //     case false:
        //         // if (this.sizzle.isPlaying) {
        //             this.sizzle.stop();
        //         // }
        //         break;
        //     default:
        //         break
        // }
    }

    addSizzle(item) {
        console.log(item);
        if (!this.Items.has(item)) {
            this.Items.set(item, this.scene.getMeshByName(item));
            this.enableSizzle(true);
            setTimeout(() => { this.cookItem(item) }, this.COOK_TIMER);
        }
    }

    removeSizzle(item, play) {
        this.Items.delete(item);
        console.log(this.Items.size);
        // this.enableSizzle(play);
        if (this.Items.size == 0) {
            this.enableSizzle(false);
        }
    }

    cookItem(item) {
        var mesh = this.Items.get(item);
        if (mesh) {
            console.log("%s: %s", mesh.name, mesh.metadata.classInstance.cook_time);
            mesh.metadata.classInstance.cook();
            setTimeout(() => {
                this.cookItem(item)
            }, this.COOK_TIMER);
        }
    }

    checkCook(item, time, position) {
        var mesh = this.Items.get(item);
        if (mesh) {
            if (time - mesh.metadata.classInstance.cook_time > 0.2) {
                mesh.metadata.classInstance.cook_time = time;
                console.log("Corrected %s to %s", item, time);
            }
        }
    }
}