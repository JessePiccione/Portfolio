//'imports'
require('dotenv').config({path:'creds.env'});
const express = require('express');
const session = require('express-session');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const { Datastore } = require('@google-cloud/datastore');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const request = require('request');
const cookieParser = require('cookie-parser');
//server configurations and enviroments
const PORTFOLIO = process.env.PORTFOLIO;
const PIECE = process.env.PIECE;
const title = process.env.TITLE; 
const projectId=process.env.PROJECT;
const keyfile=process.env.KEYFILE;
const DOMAIN=process.env.DOMAIN;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const datastore = new Datastore({
    projectId: projectId,
    keyfileName: keyfile
});
const app =  express();
const checkJwt2 = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${DOMAIN}/.well-known/jwks.json`,    
    }),
    // Validate the audience and the issuer.
    issuer: `https://${DOMAIN}/`,
    getToken: (req) => req.cookies.jwt,
    algorithms: ['RS256']
});
app.engine('handlebars', engine({
    helpers: {
        json: function(context){
            return JSON.stringify(context);
        }
    }
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(function(req, res, next) {
    // Check if the requested method is allowed for the route
    const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    if (!allowedMethods.includes(req.method)) {
      // Method Not Allowed
      res.status(405).set('Allow', allowedMethods.join(', ')).send({Error:'Not supported method call for api'});
      return;
    }
    const acceptableContentTypes = ['application/json', 'text/html'];
    if (
        req.headers['content-type'] &&
        !acceptableContentTypes.includes(req.headers['content-type'])
    ) {
        // Not Acceptable
        res.status(406).send('Not Acceptable');
        return;
    }
    // Continue to the next middleware or route handler
    next();
});
//modeling functions
function parseJwt (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}
function fromDatastore(item){
    item.id = item[Datastore.KEY].id;
    return item;
}
async function post_portfolio(portfolio){
    var key = datastore.key(PORTFOLIO);
    const new_portfolio = portfolio;
    var entity = {
        key:key,
        data:new_portfolio
    };
    var results = await datastore.insert(entity);
    const id = results[0].mutationResults[0].key.path[0].id;
    key = datastore.key([PORTFOLIO, parseInt(id, 10)]);
    [results] = await datastore.get(key);
    results.self = results.self+id;
    entity = {
        key: key,
        data: results
    }
    await datastore.update(entity);
    const query = datastore.createQuery(PORTFOLIO);
    results = await datastore.runQuery(query).then((entities)=>{
        return entities[0].map(fromDatastore).filter(item => item.owner === new_portfolio.owner);
    });
    return results;
}
async function post_piece(piece){
    var key = datastore.key(PIECE);
    const new_piece = piece;
    var entity ={
        key: key,
        data: new_piece
    }
    var results = await datastore.insert(entity);
    const id = results[0].mutationResults[0].key.path[0].id;
    key = datastore.key([PIECE, parseInt(id, 10)]);
    new_piece.self += id;
    entity = {
        key: key,
        data: new_piece
    };
    await datastore.update(entity);
    const query = datastore.createQuery(PIECE);
    results = await datastore.runQuery(query).then((entities)=>{
        return entities[0].map(fromDatastore);
    });
    return results;
}
//routers 
const router = express.Router();
const login = express.Router();

//router - routes 
router.get('/', function(req, res){
    const context = {title: title};
    res.render('home', context);
});
router.get('/userpage', checkJwt2, async function(req, res){
    const query1 = datastore.createQuery(PORTFOLIO);
    const query2 = datastore.createQuery(PIECE);
    const context = {
        title: title,
        portfolios: await datastore.runQuery(query1).then((entities)=>{
            console.log('I get here 1');
            return entities[0].map(fromDatastore).filter(item => item.owner === req.auth.sub);
        }),
        pieces: await datastore.runQuery(query2).then((entities)=>{
            console.log('I get here 2');
                return entities[0].map(fromDatastore).filter(item => item.owner === req.auth.sub);
        })
    }; 
    res.status(200).render('userpage', context);
});
router.get('/piece', async function(req, res){
    const page = req.body.page? req.body.page: 1;
    const query = datastore.createQuery(PIECE).limit(5).offset((page - 1) * 5);
    const context = {
        title:title,
        pieces: await datastore.runQuery(query).then((entities)=>{
            return entities[0].map(fromDatastore);
        }),
        next:`/piece?page=${page+1}`
    }; 
    res.status(200).send(context);
});
router.get('/piece/:id', checkJwt2, async function(req,res){
    var context = {
        title:title, 
    }
    const key = datastore.key([PIECE, parseInt(req.params.id, 10)||1]);
    [ context.piece ] = await datastore.get(key);
    if(!context.piece){
        context.Error = 'No Piece exists with GIVEN id in system';
        res.status(404).send(context);
        return;
    }
    res.status(200).send(context);
});
router.post('/piece', checkJwt2, async function(req, res){
    var context = {
        title:title,
    };
    const piece = {
        name: req.body.name, 
        description: req.body.description,
        price: req.body.price,
        portfolio_id: req.body.portfolio_id,
        owner: req.auth.sub,
        image_url: 'image url',
        self: `${req.protocol}://${req.get('host')}/${PORTFOLIO}/`,
    };
    if(!piece.name || !piece.description || !piece.price || !piece.portfolio_id || !piece.owner || !piece.image_url){
        context.Error = 'ERROR MISSING ONE OF THE REQUIRED FIELDS';
        res.status(400).json(context);
        return;
    }
    const pkey = datastore.key([PORTFOLIO, parseInt(piece.portfolio_id, 10) || 1]);
    const [portfolio] = await datastore.get(pkey);
    if(!portfolio){
        context.Error = 'no portfolio with this ID exists'
        res.status(404).json(context);
        return;
    }
    context.pieces = await post_piece(piece);
    res.status(201).json(context);

});
router.delete('/piece/:id', checkJwt2, async function(req, res){
    var context = {
        title: title
    };
    const key = datastore.key([PIECE, parseInt( req.params.id, 10)]);
    const [ piece ] = await datastore.get(key);
    if(!piece){
        context.Error = 'NO PIECE FOUND WITH GIVEN ID';
        res.status(404).send(context);
        return;
    }
    await datastore.delete(key);
    res.status(204).send();
});
router.delete('/piece/:id/portfolio', checkJwt2, async function(req, res){
    var context = {
        title: title
    };
    const key = datastore.key([PIECE, parseInt( req.params.id, 10)||1]);
    var [ piece ] = await datastore.get(key);
    if( !piece ){
        context.Error = 'No Piece found with specified id';
        res.status(404).send(context);
        return;
    }
    piece.portfolio_id='';
    const entity = {
        key:key,
        data:piece
    };
    await datastore.update(entity);
    [piece] = await datastore.get(key);
    context.piece = piece;
    res.status(200).send(context);
});
router.put('/piece/:id', checkJwt2, async function(req, res){
    var context = {
        title: title,
    };
    if(!req.body.name || !req.body.description || !req.body.price || !req.body.portfolio_id || !req.body.image_url){
        context.Error = 'ERROR MISSING ONE OF THE REQUIRED FIELDS';
        res.status(400).send(context);
        return;
    }
    const key = datastore.key([PIECE, parseInt(req.params.id, 10)||1]);
    var [piece] = await datastore.get(key);
    const pkey = datastore.key([PORTFOLIO, parseInt(req.body.portfolio_id,10)||1])
    const [portfolio] = await datastore.get(pkey);
    if( !piece ){
        context.Error = 'NO PIECE ENTITY FOUND WITH GIVEN ID';
        res.status(404).send(context);
        return;
    }
    if( !portfolio){
        context.Error = 'No Portfolio found with given id';
        res.status(404).send(context);
        return;
    }
    piece.name = req.body.name;
    piece.description = req.body.description;
    piece.price = req.body.price;
    piece.portfolio_id = req.body.portfolio_id;
    piece.image_url = req.body.image_url;
    const entity = {
        key: key,
        data: piece
    };

    await datastore.update(entity);
    res.status(303).location(`${req.protocol}://${req.get('host')}/userpage`).send();
});
router.patch('/piece/:id', checkJwt2, async function(req, res){
    var context = {
        title: title,
    };
    const key = datastore.key([PIECE, parseInt(req.params.id, 10)||1]);
    var [piece] = await datastore.get(key);
    if( !piece ){
        context.Error = 'NO PIECE ENTITY FOUND WITH GIVEN ID';
        res.status(404).send(context);
        return;
    }
    piece.name = req.body.name ? req.body.name : piece.name;
    piece.description = req.body.description ? req.body.description : piece.description;
    piece.price = req.body.price ? req.body.price : piece.price;
    piece.portfolio_id = req.body.portfolio_id ? req.body.porfolio_id : piece.portfolio_id;
    piece.image_url = req.body.image_url ? req.body.image_url : piece.image_url;
    const pkey = datastore.key([PORTFOLIO,parseInt(piece.portfolio_id,10)||1]);
    const [portfolio] = await datastore.get(pkey);
    if(!portfolio){
        context.Error = 'No portfolio found with given id';
        res.status(404).send(context);
        return;
    }
    const entity = {
        key: key,
        data: piece
    };
    await datastore.update(entity);
    res.status(303).location(`${req.protocol}://${req.get('host')}/userpage`).send();
});
router.get('/portfolio', async function(req, res){
    const page = req.body.page? req.body.page: 1;
    const query = datastore.createQuery(PORTFOLIO).limit(5).offset((page - 1) * 5);
    const context = {
        title:title,
        pieces: await datastore.runQuery(query).then((entities)=>{
            return entities[0].map(fromDatastore).filter(item => item.public);
        }),
        next:`/portfolio?page=${page+1}`
    }; 
    res.status(200).send(context);
});
router.get('/portfolio/:id', checkJwt2, async function(req, res){
    const id = parseInt(req.params.id, 10) || 1;
    const key = datastore.key([PORTFOLIO,id]);
    const [entity] = await datastore.get(key);
    var context = {
        title:title,
        portfolio:entity
    };
    if(!entity){
        context.Error = 'No Portfolio found with given id';
        res.status(404).send(context);
        return;
    }
    res.status(200).send(context); 
});
router.post('/portfolio',  checkJwt2, async function(req, res){
    var context = {title:title};
    if(!req.body.name || !req.body.type || !req.body.public){
        context.Error = "The request body is missing one of the required attributes";
        res.status(400).json(context);
        return;
    }
    const portfolio = {
        name:req.body.name,
        type:req.body.type,
        public:parseInt(req.body.public, 10),
        owner:req.auth.sub,
        self:`${req.protocol}://${req.get('host')}/${PORTFOLIO}/`
    };
    context.portfolios = await post_portfolio( portfolio );
    res.status(201).json(context);
});
router.delete('/portfolio/:id', checkJwt2, async function(req, res){
    var context = {
        title:title,
    };
    const key = datastore.key([PORTFOLIO, parseInt(req.params.id, 10)]);
    const [entity] = await datastore.get(key);
    if (!entity){
        context.Error = "NO ENTITY FOUND FOR DELETION UNDER GIVEN ID";
        res.status(404).send(context);
        return;
    }
    const deleteEntity = await datastore.delete(key);
    res.status(204).json(context);
});

router.put('/portfolio/:id', checkJwt2, async function(req, res){
    var context = {
        title:title,
    };
    if(!req.body.name || !req.body.type || !req.body.public){
        context.Error = "The request body is missing one of the required attributes";
        res.status(400).send(context);
        return;
    }
    const id = parseInt(req.params.id, 10) || 1;
    const key = datastore.key([PORTFOLIO, id]);
    const [entity] = await datastore.get(key);
    if( !entity ){
        context.Error = "NO PORTFOLIO FOUND WITH GIVEN ID";
        res.status(404).send(context);
        return;
    }
    entity.type = req.body.type;
    entity.name = req.body.name;
    entity.public = req.body.public;
    const payload = {
        key:key,
        data:entity
    };
    await datastore.update(payload);
    res.status(303).location(`${req.protocol}://${req.get('host')}/userpage`).send();    
});
router.patch('/portfolio/:id', checkJwt2, async function(req, res){
    var context = {
        title:title,
    };
    var key = await datastore.key([PORTFOLIO, req.params.id]);
    var [ portfolio ] = await datastore.get(key);
    if( !portfolio ){
        context.Error = "NO PORTFOLIO FOUND WITH GIVEN ID";
        res.status(404).send(context);
        return;
    }
    portfolio.type = req.body.type ? req.body.type : portfolio.type;
    portfolio.name = req.body.name ? req.body.name : portfolio.name;
    portfolio.public = parseInt((req.body.public ? req.body.public : portfolio.public), 10);
    const entity = {
        key:key,
        data: portfolio
    };
    await datastore.update(entity);
    res.render(303).location(`${req.protocol}://${req.get('host')}/userpage`).send();
});
//login - routes 
login.get('/', (req, res)=>{
    const context = {title: title};
    res.status(200).render('login', context);
});
login.post('/', async (req, res)=>{
    try{
        const username = req.body.username ? req.body.username : '';
        const password = req.body.password ? req.body.password : '';
        console.log({
            username:username,
            password:password

        });

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
        await request(request_options, async function(error, response, body) {
            if(error){
                response.status(500).send(error);
            } else {
                context = {
                    title:title,
                };
                console.log(body);
                //get portfolios of the user 
                const token = parseJwt(body.id_token);
                console.log(token);
                const query = datastore.createQuery(PORTFOLIO);
                context.portfolios = await datastore.runQuery(query).then((entities) => {
                    return entities[0].map(fromDatastore).filter(item => item.owner === token.sub);
                })
                res.cookie('jwt', body.id_token, { httpOnly: true })
                res.status(200).render('userpage', context);
            }
        });
    } catch (error){
        console.error(error);
    }
});
login.get('/create/user', (req, res)=>{
    const context = {title: title};
    res.status(200).render('newuser',context);
});
login.post('/create/user', async function(req, res){
    try{
        var context = {
            title: title,
        }
        const {username, password} = req.body;
        if(!username || !password){
            context.Error = 'One of the request parameters is misssing in the body';
            res.status(400).render('newuser', context);
            return;
        }
        const token = process.env.TOKEN;
        const options  = {
            url: `https://${DOMAIN}/api/v2/users`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token
            },
            json: {
                connection: 'Username-Password-Authentication',
                email: username,
                password: password,
            },
        };
        request(options, async function(error, response, body){
            if(error){
                console.error(error);
                res.status(500).json({Error:'An Error occured while creeting the new user'});
                return;
            } else{
                context = {
                    Message: 'User Created Successfully'
                };
                const query = datastore.key(['user',username]);
                const [results] = await datastore.get(query);
                if(!results){
                    const key = datastore.key('user');
                    const entity = {
                        key:key,
                        data:{username:username}
                    };
                    await datastore.insert(entity);
                }
                res.status(201).send(context);
            }
        });
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'An error Occured while creating the user'});
    }
});
login.get('/user', async function(req, res){
    const key = datastore.createQuery('user');
    const results = await datastore.runQuery(key).then((entities)=>{
        return entities[0].map(fromDatastore);
    });
    const context = {
        title:title,
        users:results
    }
    res.status(200).send(context);
});
//apply routes 
app.use('/', router);
app.use('/login', login);
const PORT = process.env.PORT || 7000;
app.listen(PORT, async function(req, res){
    console.log(`App listening on Port:${PORT} Press Ctrl-C to Cancel`);
});