var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var fs = require("fs");
var ejs = require('ejs');
var path = require('path');
var Lazy = require('lazy');
var csv = require('node-csv').createParser();
const http = require('http');
//var io = require('socket.io')(http);
var assert = require('assert');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var port = process.env.PORT || 3000

let trackingState = {}

mongoose.Promise = global.Promise;
var url = 'mongodb://localhost:27017/polyglotdev-test';
mongoose.connect(url, { useNewUrlParser: true });
autoIncrement.initialize(mongoose.connection);

global.holeData = new mongoose.Schema({

    lat: {
      type: String,
      id: { type: Schema.Types.ObjectId, ref: 'lat' }
    },
    lon: {
      type: String,
      id: { type: Schema.Types.ObjectId, ref: 'lon' }
    },
    width: {
      type: String,
      id: { type: Schema.Types.ObjectId, ref: 'width' }
    },
    length: {
      type: String,
      id: { type: Schema.Types.ObjectId, ref: 'length' }
    },
    area: {
      type: String,
      id: { type: Schema.Types.ObjectId, ref: 'area' }
    },
    level: {
      type: String,
      id: { type: Schema.Types.ObjectId, ref: 'level' }
    },
    price: {
      type: String,
      id: { type: Schema.Types.ObjectId, ref: 'price' }
    },
    imagePath: {
      type: String
    },
    id: { type: Schema.Types.ObjectId, ref: 'Photo' },

});

holeData.plugin(autoIncrement.plugin, 'lat');
holeData.plugin(autoIncrement.plugin, 'lon');
holeData.plugin(autoIncrement.plugin, 'width');
holeData.plugin(autoIncrement.plugin, 'length');
holeData.plugin(autoIncrement.plugin, 'area');
holeData.plugin(autoIncrement.plugin, 'level');
holeData.plugin(autoIncrement.plugin, 'price');

var Hole = mongoose.model("Hole", holeData);
var app = express();

var upload = multer({
    dest: 'uploads/',
    storage: multer.memoryStorage()
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/uploads'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//const server = require('http').Server(app);
// socket.io
const io = require('socket.io').listen(server);
// handling socket.io requests

app.get('/', function(req, res){
	res.sendFile('index.html', { root: __dirname });
});

app.post('/', upload.single('test'), function (req, res, next) {
  var txt1 = req.file.buffer.toString();
  var now = new Date();
  var datetime = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '-' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  var imgName = 'hole-' + datetime + '.jpg';

  var arr = txt1.split(";").map(val => val);
  var data = arr[arr.length-1];
  var buf = new Buffer(data, 'base64');
  console.log('lat: ');
  console.log(arr[0]);
  console.log('lon: ');
  console.log(arr[1]);
  console.log('width: ');
  console.log(arr[2]);
  console.log('length: ');
  console.log(arr[3]);
  console.log('area: ');
  console.log(arr[4]);
  console.log('level: ');
  console.log(arr[5]);
  console.log('price: ');
  console.log(arr[6]);

  var myData = new Hole({ lat: arr[0], lon: arr[1], width:arr[2], length:arr[3], area:arr[4],
    level:arr[5], price:arr[6], imagePath: 'http://localhost:3000/' + imgName});

  myData.save()
    .then(item => {
      res.send("item saved to database");
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });

  fs.writeFile('./uploads/' + imgName, buf, function (err) {
    if (err) {
      return next(err);
    }
    res.end('Success!');
  });
});

app.post('/location', function(req, res) {
  io.emit("location:changed", "req.body");
});

app.get('/images', function(req, res) {
  app.getImages(function(err, genres) {
    if (err) {
      throw err;
    }
    res.json(genres);
  });
});

app.get('/sendData', function(req, res, data){
  res.render('index', );
});

app.getImages = function(callback, limit) {
  Hole.find(callback).limit(limit);
}

var server = app.listen(port, function() {
    console.log("Listening on port %s...", server.address().port);
});
