

class Slip {
    constructor( number ){
        this.number = number;
        this.current_boat = null;
    }
    getNumber(){
        return this.number;
    }
    getBoat(){
        return this.current_boat; 
    }
    isEmpty(){
        return this.current_boat == null; 
    }
    setBoat(id){
        this.current_boat = id;
    }
}
module.exports = Slip;