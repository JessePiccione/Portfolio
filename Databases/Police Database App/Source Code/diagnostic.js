const express = require("express");
const app = express();
const path = require('path');
const router = express.Router();

app.use(express.static(__dirname + '/public'));

router.get('/', function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

router.get('/Criminals', function(req,res){
    res.sendFile(path.join(__dirname+'/Criminals.html'));
});

router.get('/Fines', function(req,res){
    res.sendFile(path.join(__dirname+'/Fines.html'));
});

router.get('/Officers', function(req,res){
    res.sendFile(path.join(__dirname+'/Officers.html'));
});

router.get('/ReportFines', function(req,res){
    res.sendFile(path.join(__dirname+'/ReportFines.html'));
});

router.get('/Reports', function(req,res){
    res.sendFile(path.join(__dirname+'/Reports.html'));
});

app.use('/', router);
app.listen(process.env.PORT || 5911);

console.log("Running at Port 5911");
