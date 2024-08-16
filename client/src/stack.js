export class Stack {

    layers = [];
    top;
    constructor(top, bottom){
        this.addToStack(bottom);
        this.addToStack(top);
    }

    addToStack(item){
        this.layers.push(item);
        this.top = item.metadata
    }
}