var express = require("express");
var app = express();
//var router = express.Router();
//var path = __dirname + '/views/';
var path = require('path');
var neo4j =require('neo4j-driver').v1;
var bodyParser = require('body-parser');


var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '1234'));
var session = driver.session()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));


// index page 
app.get('/', function(req, res) {
  session
  .run('MATCH (n:Places) RETURN n')
  .then(function(results){
    
    var PlacesArr=[];

    results.records.forEach(function(record) {
      PlacesArr.push({
        name:record._fields[0].properties.name
      });
      
    });
    res.render('pages/index');
  })
  .catch(function(err){
    console.log(err);
  });
});


app.get('/recommend', function(req, res) {
  res.render('pages/basic_recommend');
});

app.post('/recommend/run', function(req, res){
var user = req.body.user;
var terminal = req.body.terminal;
var gate = req.body.gate;
//var user = "user5"
 //console.log(user);
 session
 .run('MATCH (p:Place),(p)-[:AT_GATE]->(g:Gate),(g)-[:IN_TERMINAL]->(t:Terminal) WHERE t.name = {terminalParam} WITH p,g,t,abs(g.gate-toInt({gateParam})) AS dist  ORDER BY dist RETURN p LIMIT 5', {terminalParam:terminal, gateParam:gate})
  //'MATCH (p:Place), (u:User)-[LIKES]->(p) WHERE u.name={userParam} RETURN p', {userParam:user} )
 .then(function(results){
   
   var PlacesArr=[];

   results.records.forEach(function(record) {
     PlacesArr.push({
       name:record._fields[0].properties.name
     });
     console.log(record._fields[0].properties);
   });

   res.render('pages/results', {
     places:PlacesArr
   });
 })
 .catch(function(err){
   console.log(err);
 });

});


app.get('*', function(req, res) {
  res.render('pages/index');
});

app.listen(3001,function(){
  console.log("Live at Port 3001");
});