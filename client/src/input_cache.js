export class Input_Cache {
    CACHE; //The array holding the inputs
    LAST_SENT;  //Integer to keep track of which input we last sent
    LAST_RECEIVED;  //Integer to keep track of which input was last verified and received
    END;    //The current ending index of the WINDOW
    constructor(size) {
        this.CACHE = new Array(size).fill(null);
        this.LAST_SENT = -1;
        this.LAST_RECEIVED = -1;
        this.END = 0;
    }

    //Add items to the cache by appending
    //them to the end or cycling back to the beginning.
    //Only accept input when the buffer is not full
    addToCache(input) {
        if (this.LAST_SENT - this.LAST_RECEIVED < this.CACHE.length) {
            if (this.END == this.CACHE.length) {
                this.END = 0;
            }
            this.CACHE[this.END] = input;
            this.END++;
            this.LAST_SENT++;   //Update last sent
            return true;
        }
        return false;
    }

    //When you remove an input from the cache,
    //shift everything above the input to the front
    removeFromCache(index) {
        if (this.LAST_SENT - this.LAST_RECEIVED > this.CACHE.length) {
            console.log("Warning: More sent than removed %s:%s", this.LAST_SENT, this.LAST_RECEIVED);
        }
        this.LAST_RECEIVED = index;
    }

    get(index) {
        if (this.LAST_SENT - this.LAST_RECEIVED <= this.CACHE.length && index > this.LAST_RECEIVED && index <= this.LAST_SENT) {
            return this.CACHE[index % this.CACHE.length];
        }
        return null;
    }

    validate(index, val) {
        if (this.CACHE[index][0].equals(val)) {
            return true;
        }
        return false;
    }
}