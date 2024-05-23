import { ActionManager, ExecuteCodeAction, Scalar, Scene } from "@babylonjs/core";
//Class that monitors all the input from the Player
//Game makes decision based off of these calculated inputs
export class PlayerInput {
    inputMap;
    vertical;
    horizontal;
    verticalAxis;
    horizontalAxis;
    grabbed;
    constructor(scene) {
        scene.actionManager = new ActionManager(scene);
        this.inputMap = {};

        //Two actions, key down and key up. If it was a keydown, the key value is true otherwise false
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));

        this.grabbed = false;

        scene.onBeforeRenderObservable.add(() => {
            this.updateFromKeyboard();
        })
    }

 updateFromKeyboard() {
        if (this.inputMap["ArrowUp"] || this.inputMap["w"]) {
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
            this.verticalAxis = 1;
        } else if (this.inputMap["ArrowDown"] || this.inputMap["s"]) {
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1;
        } else {
            this.vertical = 0;
            this.verticalAxis = 0;
        }

        if (this.inputMap["ArrowLeft"] || this.inputMap["a"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;

        } else if (this.inputMap["ArrowRight"] || this.inputMap["d"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;
        }
        else {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }

        if(this.inputMap["e"]){
            this.grabbed = true;
            console.log("grabbing");
        }else{
            this.grabbed = false;
        }
    }
}