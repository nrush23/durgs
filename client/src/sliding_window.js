export class Sliding_Window {
    WINDOW;
    START;
    END;
    constructor(size) {
        this.START = 0;
        this.END = 0;
        this.WINDOW = new Array(size).fill(null);
    }

    addToWindow(item) {
        this.WINDOW[this.END % this.WINDOW.length] = item;
        if((this.END - this.START) < this.WINDOW.length){
            this.END++;
        }else{
            this.START++;
        }
    }

    removeFromWindow(index){
        if(index >= this.START && index < this.END){
            this.START = index + 1;
        }
    }

    getEnd(){
        return (this.END % this.WINDOW.length);
    }

    get(index){
        if(index < this.START){
            return null;
        }
        return this.WINDOW[index % this.WINDOW.length];
    }

    print() {
        let output = '';
        for (let i = this.START; i < this.END; i++) {
            output += this.WINDOW[i % this.WINDOW.length] + ' ';
        }
        console.log(output.trim());
    }
}