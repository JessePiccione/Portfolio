require('dotenv').config({path:'creds.env'});
const express = require('express');
const { google } = require('googleapis');
const uuid = require('uuid');
const { Datastore } = require('@google-cloud/datastore');
const projectId = 'nimble-radio-386900';
const datastore = new Datastore({
    projectId: projectId,
    keyFilename: 'keyfile.json'
  });
const app = express();
const port = process.env.PORT || 8080;

// Set up routes
app.get('/', async (req, res) => {
  const state = uuid.v4(); // generate a random state
  const key = datastore.key(['State']);
  const entity = {
    key,
    data: {
      value: state
    }
  };
  await datastore.save(entity); // store the state in Datastore
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=https://www.googleapis.com/auth/userinfo.profile&state=${state}`;
  res.send(`<a href="${authUrl}">It is time to sign in with Google</a>`);
});
app.get('/oauth', async (req, res) => {
  // Verify the state parameter
  const state = req.query.state;
  const query = datastore.createQuery('State').filter('value', '=', state);
  const [entities] = await datastore.runQuery(query);
  if (entities.length === 0) {
    res.status(403).send('Invalid state parameter');
    return;
  }

  // Delete the state from Datastore
  const key = entities[0][datastore.KEY];
  await datastore.delete(key);

  // Exchange the authorization code for an access token
  const { tokens } = await oauth2Client.getToken(req.query.code);
  oauth2Client.setCredentials(tokens);

  // Call the Google People API to get the user info
  const peopleApi = google.people({
    version: 'v1',
    auth: oauth2Client
  });
  const { data } = await peopleApi.people.get({
    resourceName: 'people/me',
    personFields: 'names'
  });

  // Display the user info
  const givenName = data.names[0].givenName;
  const familyName = data.names[0].familyName;
  res.send(`<h1>Hello, ${givenName} ${familyName}!</h1><p>Your state is: ${state}</p>`);
});

// Set up the OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
