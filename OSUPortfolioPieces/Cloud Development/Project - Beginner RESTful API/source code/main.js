const Boat = require('./models/Boat');
const Slip = require('./models/Slip.js');

const {Datastore} = require('@google-cloud/datastore');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const projectId = '';

// Instantiates a client
const datastore = new Datastore({
  projectId: projectId,
  keyFilename: 'keyfile.json'
});

async function getAll(type) {
  const query = datastore.createQuery(type);
  const [boats] = await datastore.runQuery(query);
  return boats;
}

async function addEntity(kind, data) {
  const entity = {
    key: datastore.key(kind),
    data: data,
  };
  const result = await datastore.insert(entity);
  const insertedEntity = {
    id: result[0].mutationResults[0].key.path[0].id,
    ...data,
  };
  return insertedEntity;
}

app.use(bodyParser.json());


app.delete('/slips/:slip_id/:boat_id', async function(req, res){
  var slip_id = parseInt(req.params.slip_id);
  var boat_id = parseInt(req.params.boat_id);
  var slipKey = datastore.key(['Slip', slip_id]);
  var boatKey = datastore.key(['Boat', boat_id]);
  var [slip] = await datastore.get(slipKey);
  var [boat] = await datastore.get(boatKey);
  console.log(slip);
  console.log(boat);
  if(!slip || !boat || slip.current_boat != boat_id.toString()){
    res.status(404).send({
      "Error": "No boat with this boat_id is at the slip with this slip_id"
      });
      return;
  }
  slip.current_boat = null;
  var entity = {'key': slipKey, 'data': slip};
  content = await datastore.save(entity);
  res.status(204).send(content);
});

app.put("/slips/:slip_id/:boat_id", async function(req, res){
  var slip_id = parseInt(req.params.slip_id);
  var slipKey = datastore.key(['Slip', slip_id]);
  var [slip] = await datastore.get(slipKey);
  var boat_id = parseInt(req.params.boat_id);
  var boatKey = datastore.key(['Boat', boat_id]);
  var [boat] = await datastore.get(boatKey);
  if (!slip || !boat) {
    res.status(404).send({'Error':'The specified boat and/or slip does not exist'});
    return;
  } 
  if(slip.current_boat != null){
    res.status(403).send({'Error':'The slip is not empty'});
    return;
  }
  slip.current_boat = boat_id.toString();
  var entity = {'key':slipKey,'data':slip};
  content = await datastore.save(entity);
  res.status(204).send();
});
app.get('/slips', async function(req, res){
  const slips = await getAll('Slip');
  res.json(slips);
});
app.post('/slips', async function(req, res) {
  if (!req.body.number) {
    res.status(400).send({"Error":"The request object is missing the required number"});
    return;
  }
  let body = req.body;
  var temp = new Slip(req.body.number);
  temp.current_boat = null;
  context = await addEntity('Slip', temp);
  res.status(201).send(context);
});
app.get('/slips/:id', async function(req, res){
  var id = parseInt(req.params.id);
  var slipKey = datastore.key(['Slip', id]);
  var [slip] = await datastore.get(slipKey);
  if (!slip) {
    res.status(404).send({'Error':'No slip with this slip_id exists'});
  } else {
    res.send(slip);
  }
});

app.delete('/boats/:boat_id', async function(req, res){
  const id = parseInt(req.params.boat_id);
  var boatKey = datastore.key(["Boat", id]);
  try {
    var [boat] = await datastore.get(boatKey);
    if(!boat){
      res.status(404).send({'Error': 'No boat with this boat_id exists'});
      return;
    }
    await datastore.delete(boatKey);
    res.status(204).json();
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
app.delete('/slips/:slip_id', async function(req, res){
  const id = parseInt(req.params.slip_id);
  var slipKey = datastore.key(["Slip", id]);
  try {
    var [slip] = await datastore.get(slipKey);
    if(!slip){
      res.status(404).send({'Error': 'No slip with this slip_id exists'});
      return;
    }
    await datastore.delete(slipKey);
    res.status(204).json();
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
app.get('/boats', async function(req, res) { 
  const boats = await getAll('Boat');
  res.json(boats);
});

app.get('/boats/:boat_id', async function(req, res){
  var id = parseInt(req.params.boat_id);
  var boatKey = datastore.key(['Boat', id]);
  var [boat] = await datastore.get(boatKey);
  if (!boat) {
    res.status(404).send({'Error':'No boat with this boat_id exists'});
  } else {
    res.send(boat);
  }
});
app.post('/boats', async function(req, res) {
  console.log(req.body);
  if (!req.body.name || !req.body.type || !req.body.length) {
    res.status(400).send({"Error":"The request object is missing at least one of the required attributes"});
    return;
  }
  let body = req.body;
  context = await addEntity('Boat', new Boat(req.body.name, req.body.type, req.body.length));
  console.log(context);
  res.status(201).send(context);
});
app.patch('/boats/:boat_id', async function(req, res){
  const id = req.params.boat_id
  if (!req.body.name || !req.body.type || !req.body.length) {
    res.status(400).send({"Error":"The request object is missing at least one of the required attributes"});
    return;
  }
  const boatKey = datastore.key(['Boat', parseInt(id, 10)]);
  const [boat] = await datastore.get(boatKey);
  if(!boat){
    res.status(404).send({'Error':'No boat with this boat_id exists'});
    return;
  }
  const updates = req.body;
  for (const [key, value] of Object.entries(updates)){
    boat[key] = value;
  }
  entity = {'key': boatKey, data: boat};
  var context = await datastore.update(entity);
  res.status(200).send(boat);
});
// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
