const express = require('express');
const app = express()
const path = require('path');
const json2html = require('json-to-html');

const { Datastore } = require("@google-cloud/datastore");

const bodyParser = require('body-parser');
const request = require('request');

const projectId = 'irapi-385318';
const datastore = new Datastore({
    projectId: projectId,
    keyFileName: 'keyfile.json' 
});

const {expressjwt: jwt} = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const BOAT = "boats"

const router = express.Router();
const login = express.Router();

const CLIENT_ID="PSHfiogYDeQC3bxasI9Y2VbrAPKtAmXb";
const CLIENT_SECRET="o71IeWdliXqGPC06mcDMj8d-qWfLeAu0jTGmHmO6XtZjRARp5IiyT3sNNDmbOd_N";
const DOMAIN = "piccionj-oregonstate-edu.us.auth0.com";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${DOMAIN}/.well-known/jwks.json`
    }),
    // Validate the audience and the issuer.
    issuer: `https://${DOMAIN}/`,
    algorithms: ['RS256']
});
const checkJwt2 = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${DOMAIN}/.well-known/jwks.json`
    }),
    // Validate the audience and the issuer.
    credentialsRequired: false,
    issuer: `https://${DOMAIN}/`,
    algorithms: ['RS256']
});
function fromDatastore(item){
    item.id = item[Datastore.KEY].id;
    return item;
}
//modeling functions
async function post_boats(name, type, length, public, owner){
    var key = datastore.key(BOAT);
    const new_boat = {
        "name":name,
        "type":type,
        "length":length,
        "public":public,
        "owner":owner
    }
    const entity = {
        key: key,
        data: new_boat
    };
    const result = await datastore.insert(entity);
    const id = result[0].mutationResults[0].key.path[0].id;
    return {
        "id":id,
        "name":name,
        "type":type,
        "length":length,
        "public":public,
        "owner":owner
    };
}
router.get(`/${BOAT}`, checkJwt2, async function(req, res){
    if(req.auth){
        const owner = req.auth.sub;
        const query = datastore.createQuery(BOAT);
        const boats = await datastore.runQuery(query).then((entities) => {
            return entities[0].map(fromDatastore).filter(item => item.owner === owner);
        });
        res.status(200).json(boats);
    } else {
        const query = datastore.createQuery(BOAT);
        const boats = await datastore.runQuery(query).then(entities => {
            return entities[0].map(fromDatastore).filter(item => item.public === true);
        });
        res.status(200).json(boats);
    }  
});
router.post(`/${BOAT}`, checkJwt, async function(req, res){
    var payload = await post_boats(req.body.name, req.body.type, req.body.length, req.body.public, req.auth.sub);
    res.status(201).json(payload);
});
router.get(`/owners/:owner_id/${BOAT}`, async function(req, res){
    const query = datastore.createQuery(BOAT);
    const boats = await datastore.runQuery(query).then((entities) =>{
       return entities[0].map(fromDatastore).filter(item => item.owner === req.params.owner_id);
    }); 
    res.status(200).json(boats);
}); 
router.delete(`/${BOAT}/:boat_id`, checkJwt, async function(req,res){
    const key = datastore.key([BOAT,parseInt(req.params.boat_id, 10)]);
    const [ boat ] = await datastore.get(key);
    console.log(boat);
    console.log(req.auth.sub.toString());
    if(boat && boat.owner === req.auth.sub){
        results = await datastore.delete(key);
        res.status(204).send(results);
    }
    else if(boat.owner !== req.auth.sub) {
        res.status(403).send({Error:'Not Authorized to Use this resource'});
    }
    else {
        res.status(404).send({Error:'No Boat Found'});
    }
})
//routing functions 
login.get('/', async function(req, res){
    res.sendFile(path.join(__dirname,'/public/welcomePage.html'));
});
login.get('/create/user',async function(req, res){
    res.sendFile(path.join(__dirname,'/public/createUser.html'));
});
login.post('/create/user', async function(req, res) {
    try {
      const { username, password } = req.body;
  
      const options = {
        url: `https://${DOMAIN}/api/v2/users`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ill4UVZqREluZ28xNEpGdl9WZ3RnOCJ9.eyJpc3MiOiJodHRwczovL3BpY2Npb25qLW9yZWdvbnN0YXRlLWVkdS51cy5hdXRoMC5jb20vIiwic3ViIjoidkdYRXNBMzRuOGpXR0UxNzAzZlpOSERoNnVsVHNzZkRAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vcGljY2lvbmotb3JlZ29uc3RhdGUtZWR1LnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNjg0ODE3NjcyLCJleHAiOjE2ODQ5MDQwNzIsImF6cCI6InZHWEVzQTM0bjhqV0dFMTcwM2ZaTkhEaDZ1bFRzc2ZEIiwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSByZWFkOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl9jdXN0b21fYmxvY2tzIGRlbGV0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfdGlja2V0cyByZWFkOmNsaWVudHMgdXBkYXRlOmNsaWVudHMgZGVsZXRlOmNsaWVudHMgY3JlYXRlOmNsaWVudHMgcmVhZDpjbGllbnRfa2V5cyB1cGRhdGU6Y2xpZW50X2tleXMgZGVsZXRlOmNsaWVudF9rZXlzIGNyZWF0ZTpjbGllbnRfa2V5cyByZWFkOmNvbm5lY3Rpb25zIHVwZGF0ZTpjb25uZWN0aW9ucyBkZWxldGU6Y29ubmVjdGlvbnMgY3JlYXRlOmNvbm5lY3Rpb25zIHJlYWQ6cmVzb3VyY2Vfc2VydmVycyB1cGRhdGU6cmVzb3VyY2Vfc2VydmVycyBkZWxldGU6cmVzb3VyY2Vfc2VydmVycyBjcmVhdGU6cmVzb3VyY2Vfc2VydmVycyByZWFkOmRldmljZV9jcmVkZW50aWFscyB1cGRhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpkZXZpY2VfY3JlZGVudGlhbHMgY3JlYXRlOmRldmljZV9jcmVkZW50aWFscyByZWFkOnJ1bGVzIHVwZGF0ZTpydWxlcyBkZWxldGU6cnVsZXMgY3JlYXRlOnJ1bGVzIHJlYWQ6cnVsZXNfY29uZmlncyB1cGRhdGU6cnVsZXNfY29uZmlncyBkZWxldGU6cnVsZXNfY29uZmlncyByZWFkOmhvb2tzIHVwZGF0ZTpob29rcyBkZWxldGU6aG9va3MgY3JlYXRlOmhvb2tzIHJlYWQ6YWN0aW9ucyB1cGRhdGU6YWN0aW9ucyBkZWxldGU6YWN0aW9ucyBjcmVhdGU6YWN0aW9ucyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOmluc2lnaHRzIHJlYWQ6dGVuYW50X3NldHRpbmdzIHVwZGF0ZTp0ZW5hbnRfc2V0dGluZ3MgcmVhZDpsb2dzIHJlYWQ6bG9nc191c2VycyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgdXBkYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDphbm9tYWx5X2Jsb2NrcyBkZWxldGU6YW5vbWFseV9ibG9ja3MgdXBkYXRlOnRyaWdnZXJzIHJlYWQ6dHJpZ2dlcnMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyBjcmVhdGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiBkZWxldGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiByZWFkOmN1c3RvbV9kb21haW5zIGRlbGV0ZTpjdXN0b21fZG9tYWlucyBjcmVhdGU6Y3VzdG9tX2RvbWFpbnMgdXBkYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIGRlbGV0ZTpicmFuZGluZyByZWFkOmxvZ19zdHJlYW1zIGNyZWF0ZTpsb2dfc3RyZWFtcyBkZWxldGU6bG9nX3N0cmVhbXMgdXBkYXRlOmxvZ19zdHJlYW1zIGNyZWF0ZTpzaWduaW5nX2tleXMgcmVhZDpzaWduaW5nX2tleXMgdXBkYXRlOnNpZ25pbmdfa2V5cyByZWFkOmxpbWl0cyB1cGRhdGU6bGltaXRzIGNyZWF0ZTpyb2xlX21lbWJlcnMgcmVhZDpyb2xlX21lbWJlcnMgZGVsZXRlOnJvbGVfbWVtYmVycyByZWFkOmVudGl0bGVtZW50cyByZWFkOmF0dGFja19wcm90ZWN0aW9uIHVwZGF0ZTphdHRhY2tfcHJvdGVjdGlvbiByZWFkOm9yZ2FuaXphdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGNyZWF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgcmVhZDpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBjcmVhdGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgcmVhZDpvcmdhbml6YXRpb25zX3N1bW1hcnkgY3JlYXRlOmFjdGlvbnNfbG9nX3Nlc3Npb25zIGNyZWF0ZTphdXRoZW50aWNhdGlvbl9tZXRob2RzIHJlYWQ6YXV0aGVudGljYXRpb25fbWV0aG9kcyB1cGRhdGU6YXV0aGVudGljYXRpb25fbWV0aG9kcyBkZWxldGU6YXV0aGVudGljYXRpb25fbWV0aG9kcyByZWFkOmNsaWVudF9jcmVkZW50aWFscyBjcmVhdGU6Y2xpZW50X2NyZWRlbnRpYWxzIHVwZGF0ZTpjbGllbnRfY3JlZGVudGlhbHMgZGVsZXRlOmNsaWVudF9jcmVkZW50aWFscyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.q7P-wd7IL6nMgSzIYUliPF1ITv7mhbngYcK9gUEaNJf_jxUlLEe6LX3eFXza8Wwot3ZoSTIpiLO8Ll2IHf8EB5oi7Fo-_20iGURuAPR8bq_J09YFbuwWxwdNi_1tNYJoGJRoGeAk01q11pzsqGPcOAV0I7CNDLtATkdireDdlB8-8BcmKZmUNWmAP62uoJ5AhoCzvqvbDpn8ArZya08W1gIXvwCjjIlcJfI2yxo28-j-wkAPWCQVv_6NqavNRZDuCRPSDIHTm3zagd-6gIGyxjNDzKwGEoiTecP4FRBQ3sgbp3KTF4IzwDUkfQ5Iwhusy5Nk2RWf-yxenO44MisZkg',
        },
        json: {
          connection: 'Username-Password-Authentication', // Replace with the name of your Auth0 connection
          email: username,
          password: password,
        },
      };
  
      // Make a POST request to Auth0 Management API to create a new user
      request(options, function(error, response, body) {
        if (error) {
          // Handle error
          console.error(error);
          res.status(500).json({ error: 'An error occurred while creating the user.' });
        } else {
          // Handle success
          res.json(body);
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
  });
login.post('/', function(req, res){
    const username = req.body.username ? req.body.username : '';
    const password = req.body.password ? req.body.password : '';
    var request_options = {
        method: "POST",
        url: `https://${DOMAIN}/oauth/token`,
        headers: {'content-type':'application/json'},
        body: {
            grant_type: 'password',
            username: username,
            password: password,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        },
        json: true
    };
    request(request_options, function(error, response, body) {
        if(error){
            response.status(500).send(error);
        } else {
            res.send(body);
        }
    });
});
app.use(`/`, router); 
app.use(`/login`, login);
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`App Running on Port: ${PORT} \nPress Ctrl-C to terminate...`);
});