export class Sliding_Window {
    INPUT_CACHE;
    START;
    END;
    constructor(size) {
        this.START = 0;
        this.END = 0;
        this.INPUT_CACHE = new Array(size).fill(null);
    }

    addToWindow(item) {
        this.INPUT_CACHE[this.END % this.INPUT_CACHE.length] = item;
        if((this.END - this.START) < this.INPUT_CACHE.length){
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
        return (this.END % this.INPUT_CACHE.length);
    }

    get(index){
        return this.INPUT_CACHE[index];
    }

    print() {
        let output = '';
        for (let i = this.start; i < this.end; i++) {
            output += this.array[i % this.array.length] + ' ';
        }
        console.log(output.trim());
    }
}