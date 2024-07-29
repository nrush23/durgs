import { ActionManager, ExecuteCodeAction, Scalar, Scene } from "@babylonjs/core";
//Class that monitors all the input from the Player
//Game makes decision based off of these calculated inputs
export class PlayerInput {

    inputMap;
    vertical;
    horizontal;
    verticalAxis;
    horizontalAxis;
    grab_right;
    grab_left;

    constructor(scene) {

        //Create our action manager and input map
        scene.actionManager = new ActionManager(scene);
        this.inputMap = {};

        //Two actions, key down and key up. If it was a keydown, the key value is true otherwise false
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));

        //WIP Code for registering left and right picks
        // scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, (event)=>{
        //     this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == ""
        // }));

        //By default, grabbing is false
        this.grab_right = false;

        //Add our keyboard updates to the scene
        scene.onBeforeRenderObservable.add(() => {
            this.updateFromKeyboard();
        })
    }


 /*Function to process keyboard updates from the action manager */   
 updateFromKeyboard() {

        //Check if the forward/backward movement keys are pressed
        if (this.inputMap["ArrowUp"] || this.inputMap["w"]) {
            this.vertical = "UP";
        } else if (this.inputMap["ArrowDown"] || this.inputMap["s"]) {
            this.vertical = "DOWN";
        } else {
            this.vertical = "";
        }

        //Check if the side to side movement keys are pressed
        if (this.inputMap["ArrowLeft"] || this.inputMap["a"]) {
            this.horizontal = "LEFT";
        } else if (this.inputMap["ArrowRight"] || this.inputMap["d"]) {
            this.horizontal = "RIGHT";
        }
        else {
            this.horizontal = "";
        }

        //Check for left and right grabs
        this.grab_left = this.inputMap["q"];
        this.grab_right = this.inputMap["e"];
    }
}