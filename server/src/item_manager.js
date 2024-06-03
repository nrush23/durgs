export class Item_Manager {
    item;
    available;
    used;

    constructor(item){
        this.item = item;
        this.available = [];
        this.used = [];

        for(let i = 0; i < 100; i++){
            this.available.push(i);
        }
    }

    getPool(){
        let pool = [];
        while (pool.length < 5){
            if(this.available.length == 0){
                this.available = this.used;
                this.used = [];
            }
            let index = this.available.shift();
            pool.push(index);
            this.used.push(index);
        }
        console.log("Sending %s pool: %s", this.item, pool);
        return pool;
    }

    returnToPool(index){
        this.used.splice(this.used.indexOf(index), 1);
        this.available.push(index);
    }
}