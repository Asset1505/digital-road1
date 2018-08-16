var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var fs = require("fs");
var ejs = require('ejs');
var mongoose = require('mongoose');
var path = require('path');
var Lazy = require('lazy');
var csv = require('node-csv').createParser();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/polyglotdev-test', { useNewUrlParser: true });

var holeData = new mongoose.Schema({
  data:{
    lat: {
      type: Array,
    },
    lon: {
      type: Array
    },
    width: {
      type: Array
    },
    length: {
      type: Array
    },
    area: {
      type: Array
    },
    level: {
      type: Array
    },
    price: {
      type: Array
    }
  }
});
//schema.set('toObject', { getters: true });schema.set('toObject', { getters: true });

var Hole = mongoose.model("Hole", holeData);
var app = express();

var upload = multer({
    dest: 'uploads/',
    storage: multer.memoryStorage()
});


app.set('view engine', 'ejs');

//app.use('/', routes);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function(req, res){
  console.log('Works');
  res.render('index');
});

//upload.single('test')     -----------before

app.post('/', upload.single('test'), function (req, res, next) {
  var txt1 = req.file.buffer.toString();
  var now = new Date();
  var datetime = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '-' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  var imgName = 'hole-' + datetime + '.jpg';

  var arr = txt1.split(";").map(val => val);
  //console.log(arr[0]);
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
  console.log('b64: ');
  //console.log(arr[7]);
  console.log(typeof req.file.lat);

  var arr1 = [];
  for (var i = 0; i < 81; ++i) {
    arr1.push({ val: i, arr: [0, 1, 2, 3, 4, 5] });
  }

  var myData = new Hole({lat:arr}, {lon:arr}, {width:arr}, {length:arr}, {area:arr}, {level:arr}, {price:arr});
/*
  Hole.create({ data: arr }).
  then(doc => {
    console.log(doc);
    process.exit(0);
  });
*/
  myData.save()
  /*
    .then(item => {
      res.send("item saved to database");
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });
  */

  fs.writeFile('./uploads/' + imgName, buf, function (err) {
    if (err) {
      return next(err);
    }
    res.end('Success!');
  });
});

app.get('/images', function(req, res) {
  app.getImages(function(err, genres) {
    if (err) {
      throw err;
    }
    res.json(genres);
  });
});

app.getImages = function(callback, limit) {
  Hole.find(callback).limit(limit);
}

/*
app.post("/upload", upload.array("uploads", 12), function(req, res) {
    var fileInfo = [];
    for(var i = 0; i < req.files.length; i++) {
        fileInfo.push({
            "originalName": req.files[i].originalName,
            "size": req.files[i].size,
            "b64": new Buffer(fs.readFileSync(req.files[i].path)).toString("base64")
        });
        fs.unlink(req.files[i].path);
    }
    res.send(fileInfo);
});
*/

/*
app.post('/fileInConsole', upload.array('file', 12), function (req, res, next) {
    console.log(req.files);
    var now = new Date();
    var datetime = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '-' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    var imgName = 'hole-' + datetime + '.jpg';
    fs.writeFile('./fileInConsole/' + imgName, function (err) {
      if (err) {
        //console.log('Error');
        return next(err);
      }
    res.send("done");
  });
});
*/

var server = app.listen(3000, function() {
    console.log("Listening on port %s...", server.address().port);
});
