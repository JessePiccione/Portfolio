class Boat {
    constructor( name, type, length ){
        this.name = name;
        this.type = type;
        this.length = length;
    }
    //accessor methods 
    getName(){
        return this.name;
    }
    getType(){
        return this.type;
    }
    length(){
        return this.length;       
    }
    setName(name){
        this.name = name;
    }
    setType(type){
        this.type = type;
    }
    setLength(length){
        this.length = length;
    }
}
module.exports = Boat;