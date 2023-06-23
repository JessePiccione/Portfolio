// node requirements
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const json2html = require('json-to-html');
// globals
const ds = require('./helpers/datastorehelpers');
const BOAT = 'boats';
const PORT = 8080;
// new express app
const app = express();
app.use(bodyParser.json());
// 1 request must be JSON
// 1 response must be JSON
// todo uniqueify names
app.post(`/${BOAT}`, async function (req, res) {
  const accepts = req.accepts(['application/json']);
  if (req.headers['content-type'] !== 'application/json') {
    res.status(406).send({ Error: "The Content-Type needs to be set to 'application/json'" });
    return;
  } else if (!req.body.name || !req.body.type || !req.body.length) {
    res.status(400).send({ Error: "The request object is missing at least one of the required attributes" });
    return;
  }
  const boats = await ds.viewAllEntities(BOAT);
  for (var x = 0; x < boats.length; x++) {
    // check for boat name
    if (boats[x].name == req.body.name) {
      res.status(403).send({ Error: 'Error! Name must be unique' });
      return;
    }
  }
  const self = `${req.protocol}://${req.get('host')}/${BOAT}/`;
  const newBoat = {
    name: req.body.name,
    type: req.body.type,
    length: req.body.length,
    self: self,
  };
  const [context] = await ds.addEntity(BOAT, newBoat);
  res.status(201).json(context);
});
// 2 delete a boat
app.delete(`/${BOAT}/:id`, async function (req, res) {
  const boat = await ds.viewEntity(BOAT, req.params.id);
  if (!boat) {
    res.status(404).send({
      Error: 'No boat with this boat_id exists',
    });
    return;
  }
  await ds.deleteEntity(BOAT, req.params.id);
  res.status(204).send();
});
// 3 edit a boat with any set
app.patch(`/${BOAT}/:id`, async function (req, res) {
  const accepts = req.accepts(['application/json']);
  if (req.headers['content-type'] !== 'application/json') {
    res.status(406).send({ Error: "The Content-Type needs to be set to 'application/json'" });
    return;
  }
  // get new possible boat data
  var boat = await ds.viewEntity(BOAT, req.params.id);
  if(!boat){
    res.status(404).send({'Error':"No boat with this boat_id exists"});
    return;
  }
  // enforce uniqueness
  if (req.body.name && req.body.name != boat.name) {
    var boats = await ds.viewAllEntities(BOAT);
    for (var x = 0; x < boats.length; x++) {
      if (boats[x].name == req.body.name) {
        res.status(403).send({ Error: 'Error! Name must be unique!' });
        return;
      }
    }
  }
  boat.name = req.body.name ? req.body.name : boat.name;
  boat.type = req.body.type ? req.body.type : boat.type;
  boat.length = req.body.length ? req.body.length : boat.length;
  // set new
// set new boat data at id
await ds.setEntity(BOAT, req.params.id, boat);
boat = await ds.viewEntity(BOAT, req.params.id);
res.status(200).json(boat);
});
app.put(`/${BOAT}/:id`, async function(req, res){
  const accepts = req.accepts(['application/json']);
  if(req.headers['content-type'] !== 'application/json'){
      res.status(406).send({Error:"The Content-Type needs to be set to 'application/json'"});
      return;
  }
  if(!req.body.name || !req.body.length || !req.body.type){
      res.status(400).send({'Error':'The request object is missing at least one of the required attributes'});
      return;
  }
  var boat = await ds.viewEntity(BOAT, req.params.id);
  if(!boat){
    res.status(404).send({Error:"No boat with this boat_id exists"});
    return;
  }
  const boats = await ds.viewAllEntities(BOAT);
  for (var x = 0; x < boats.length; x++){
    if(boats[x].name === req.body.name && req.body.name !== boat.name){
      res.status(403).send({Error:"Error! Name must be unique!"});
      return;
    }
  } 
  boat.name = req.body.name;
  boat.type = req.body.type;
  boat.length = req.body.length;
  await ds.setEntity(BOAT, req.params.id, boat);
  boat = await ds.viewEntity(BOAT, req.params.id);
  res.status(303).location(boat.self).send();
  return;
});
//4 view a boat
app.get(`/${BOAT}/:id`, async function(req, res){
    const accepts = req.accepts(['application/json','text/html']); 
    if(accepts === 'application/json'){
        var context = await ds.viewEntity(BOAT, req.params.id);
        if(!context){
            res.status(404).send({'Error':'No boat with this boat_id exists'});
            return;
        }

        context['id'] = req.params.id;
        res.status(200).send(context);
    } else if(accepts === 'text/html'){
        var context = await ds.viewEntity(BOAT, req.params.id);
        if(!context){
            res.status(404).send({'Error':'No boat with this boat_id exists'});
            return;
        }
        context['id'] = req.params.id;
        var html = json2html(context);
        res.status(200).send(html);
    } else {
        res.status(415).send({'Error':"Unsupported Media Type: server only accepts JSON or HTML"});
    }
});
app.listen(PORT,function(){
    console.log(`Server running on ${PORT}...\nPress ^C to terminate...`);
});