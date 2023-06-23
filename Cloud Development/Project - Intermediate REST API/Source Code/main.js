//node requiremnts
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

//globals  
const ds = require('./helpers/datastorehelpers');
const BOAT = 'boats';
const LOAD = 'loads';
const PORT = 8080;
//new express app
const app = express();
app.use(bodyParser.json());
//Gets
//3.
app.get(`/${BOAT}`, async function(req, res){
    const page = req.params.page? parseInt(req.params.page, 10):1;
    const context = {boats: await ds.viewAllEntities(BOAT,page)};
    res.status(200).send(context);
});
//2.
app.get(`/${BOAT}/:id`, async function(req, res){
    var context =  await ds.viewEntity(BOAT, req.params.id);
    if(!context){
        res.status(404).send({'Error':'No boat with this boat_id exists'});
        return;
    }
    context['id'] = req.params.id;
    res.status(200).send(context);
});
//7.
app.get(`/${LOAD}`, async function(req, res){
    const page = req.params.page? parseInt(req.params.page, 10):1;
    const context = {loads: await ds.viewAllEntities(LOAD,page)};
    res.status(200).send(context);
});
//6.
app.get(`/${LOAD}/:id`, async function(req, res){
    var context =  await ds.viewEntity(LOAD, req.params.id);
    if(!context){
        res.status(404).send({'Error':'No load with this load_id exists'});
        return;
    }
    context['id'] = req.params.id;
    res.status(200).send(context);
});
app.get(`/${BOAT}/:id/${LOAD}`, async function(req, res){
    const boat = await ds.viewEntity(BOAT, req.params.id);
    if (!boat){
        res.status(404).send({
            'Error' : 'No boat with this boat_id exists'
        });
        return;
    }
    var context = {loads:[]};
    for( var x = 0; x < boat.loads.length; x++){
        context.loads.push(await ds.viewEntity(LOAD, boat.loads[x].id ));
    }
    res.status(200).send(context);
})
//Posts
//1.
app.post(`/${BOAT}`, async function(req, res){
    if(!req.body.name || !req.body.type || !req.body.length){
        res.status(400).send({Error:"The request object is missing at least one of the required attributes"});
        return;
    }
    const self = `${req.protocol}://${req.get('host')}/${BOAT}/`;
    const newBoat = {
        name: req.body.name,
        type: req.body.type,
        length: req.body.length,
        loads: [],
        self: self,
    }
    const [context] = await ds.addEntity(BOAT, newBoat);
    //update self link 
    res.status(201).send(context);
});
//5.
app.post(`/${LOAD}`, async function(req, res){ 
    if(!req.body.volume || !req.body.item || !req.body.creation_date){
        res.status(400).send({Error:"The request object is missing at least one of the required attributes"});
        return;
    }
    const self = `${req.protocol}://${req.get('host')}/${LOAD}/`;
    const newLoad = {
        volume: req.body.volume,
        item: req.body.item,
        creation_date: req.body.creation_date,
        carrier: null,
        self: self,
    }
    const [context] = await ds.addEntity(LOAD, newLoad);
    //update self link 
    res.status(201).send(context);
});
//Puts
app.put(`/${BOAT}/:boat_id/${LOAD}/:load_id`, async function(req, res){
    var boat = await ds.viewEntity(BOAT, req.params.boat_id);
    var load = await ds.viewEntity(LOAD, req.params.load_id);
    if( !boat || !load){
        res.status(404).send({'Error':'The specified boat and/or load does not exist'});
        return;
    }
    if( load.carrier != null){
        res.status(403).send({'Error':'The load is already loaded on another boat'});
        return;
    }
    for (var x = 0; x < boat.loads.length; x++){
        if(boat.loads[x].id == req.params.load_id){
            boat.loads.splice(x,x);
        }
    }
    boat['loads'].push({
        'id': req.params.load_id,
        'self': load.self
    });
    load['carrier'] = {
        'id': req.params.boat_id,
        'name': boat.name,
        'self': boat.self 
    };
    await ds.setEntity(BOAT, req.params.boat_id, boat);
    await ds.setEntity(LOAD, req.params.load_id, load);
    const dsboat = await ds.viewEntity(BOAT, req.params.boat_id);
    const dsload = await ds.viewEntity(LOAD, req.params.load_id);
    const context = {
        boat: dsboat,
        load: dsload
    }; 
    res.status(204).send(context);
});
//remove load from boat 
app.delete(`/${BOAT}/:boat_id/${LOAD}/:load_id`, async function(req, res){
    //check if boat exists
    var boat = await ds.viewEntity(BOAT, req.params.boat_id);
    var load = await ds.viewEntity(LOAD, req.params.load_id);
    if( !boat || !load ){
        res.status(404).send({'Error':'No boat with this boat_id is loaded with the load with this load_id'});
        return;
    }
    const length = boat.loads.length;
    for (var x = 0; x < length; x++){
        if(parseInt(boat.loads[x].id) == parseInt(req.params.load_id)){
            boat.loads = boat.loads.splice(x,x);
        }
    }
    if(length == boat.loads.length){
        res.status(404).send({
            'Error':'No boat with this boat_id is loaded with the load with this load_id'
        });
        return;
    }
    load['carrier'] = null;
    await ds.setEntity(BOAT, req.params.boat_id, boat);
    await ds.setEntity(LOAD, req.params.load_id, load);
    const dsboat = await ds.viewEntity(BOAT, req.params.boat_id);
    const dsload = await ds.viewEntity(LOAD, req.params.load_id);
    var context = {
        boat: dsboat,
        load: dsload
    }; 
    res.status(204).send(context);
});
app.delete(`/${BOAT}/:id`, async function(req, res){
    const boat = await ds.viewEntity(BOAT, req.params.id);
    if( !boat ){
        res.status(404).send({
            'Error':'No boat with this boat_id exists' 
        });
        return;
    }
    var load;
    for(var x = 0; x < boat.loads.length; x++){
        if(boat.loads[x]){
            load = await ds.viewEntity(LOAD, boat.loads[x].id);
            load['carrier'] = null;
            await ds.setEntity(LOAD, boat.loads[x].id, load);
        }
    }
    await ds.deleteEntity(BOAT, req.params.id);
    res.status(204).send();
});
app.delete(`/${LOAD}/:id`, async function(req, res){
    const load = await ds.viewEntity(LOAD, req.params.id);
    if( !load ){
        res.status(404).send({
            'Error':'No load with this load_id exists' 
        });
        return;
    }
    var boat = await ds.viewEntity(BOAT, load.carrier.id);
    for(var x = 0; x < boat.loads.length; x++){
        if(boat.loads[x].id = req.params.id){
            boat.loads = boat.loads.splice(x,x);
        }
    }
    await ds.setEntity(BOAT, load.carrier.id, boat);
    await ds.deleteEntity(LOAD, req.params.id);
    res.status(204).send();
});
//errors 

app.listen(PORT,function(){
    console.log(`Server running on ${PORT}...\nPress ^C to terminate...`);
});

