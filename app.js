let express = require("express");
let app = express();
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/';

//Setting up the static assets directories
app.use(express.static('images'));
app.use(express.static('css'));

app.use(express.urlencoded({ extended: true }));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

///Connect app to MongoDB server
MongoClient.connect(url, {useNewUrlParser: true}, function (err, client) {
  if (err) {
      console.log('Err  ', err);
  } else {
      db = client.db('BookDb'); //db name
  }
});

//reference the database 
let db;

let viewsPath = __dirname + "/views/";

app.get("/", function (req, res) {
    let fileName = viewsPath + "homepage.html";
    res.sendFile(fileName);
  });

  app.get("/getNewBook", function (req, res) {
    let fileName = viewsPath + "NewBook.html";
    res.sendFile(fileName);
});

app.get('/getListBooks', function (req, res) {
  db.collection('book')
    .find({})
    .toArray(function (err, data) {
      res.render("ListBooks.html", { books: data });
    });
});

app.get("/deleteBooks", function (req, res) {
  res.sendFile(__dirname + "/views/deleteBooks.html");
});

app.get("/updateBooks", function (req, res) {
  res.sendFile(__dirname + "/views/updateBooks.html");
});

app.get("/getSummary", (req, res) => {
  let fileName = viewsPath + "getSummary.html";
  res.sendFile(fileName);
});

app.get("*", (req, res) => {
  let fileName = viewsPath + "404.html";
  res.sendFile(fileName);
});


// POST Request
app.post('/postNewBook', (req,res) =>{
  if (req.body.title.length >= 3 & req.body.author.length >= 3 & req.body.topic.length >= 3){
    db.collection('book').insertOne(req.body); //collection name
    res.redirect("/getListBooks"); 
  }else{
    let fileName = viewsPath + "InvalidData.html";
    res.sendFile(fileName);
  }
})

app.post('/postdeletebooks', function (req, res) {
  let filter = { topic: req.body.topic };
  db.collection('book').deleteMany(filter);
  res.redirect("/getListBooks"); 
});

app.post("/updatebooksdata", function (req, res) {
  let bookDetails = req.body;
  let filter = { title: bookDetails.titleold };
  if (bookDetails.titlenew.length >= 3 & bookDetails.authornew.length >= 3 & bookDetails.topicnew.length >= 3){
    let theUpdate = {
      $set: {
        title: bookDetails.titlenew,
        author: bookDetails.authornew,
        topic: bookDetails.topicnew,
        DOP: bookDetails.DOPnew,
        summary: bookDetails.summarynew,
      },
    };
    db.collection('book').updateOne(filter, theUpdate);
    res.redirect("/getListBooks"); 
  }else{
    let fileName = viewsPath + "InvalidData.html";
    res.sendFile(fileName);
  }
});

app.post('/postSummary', function (req, res) {
  let query = { topic: req.body.titleq };
    db.collection('book')
    .find(query)
    .toArray(function (err, data) {
      res.render("showSummary.html", { books: data });
    });
});


app.listen(8080);