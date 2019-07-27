const express = require("express");
const app = express();

// setting up .env
const dotenv = require("dotenv");
dotenv.config();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set("view engine", "ejs");
// Serve static content from this dir
app.use(express.static("public"));
app.locals.pretty = true;

// index page route&render
app.get("/", function(req, res) {
  res.render("pages/index");
});

// guestbook page
app.get("/guestbook", function(req, res) {
  // callback functions that get user messages (demojson) and flag data (flagdata)
  var result = getResult(function(err, result) {
    var flag = getFlags(function(err, flag) {
    //handle err, then you can render your view
    //console.log(result);
    res.render("pages/guestbook", { collection: result, collection2: flag });
    });
  });
});

// something gets posted in the /newmessage form
app.post("/newmessage", function(req, res) {
  var result = getResult(function(err, result) {
    //var flag = getFlags(function(err, flag) {
    //handle err, then you can render your view

    const MongoClient = require("mongodb").MongoClient;

    // Connection URL
    const url = process.env.MONGOLAB_URI;

    // Database Name
    const dbName = "kouludb";

    MongoClient.connect(
      url,
      { useNewUrlParser: true },
      function(err, client) {
        if (err) {
          console.log("Unable to connect to the mongoDB server. Error:", err);
        } else {
          //console.log("Connection established to", url);
          console.log("Connection established to: demojson.json - updating");

          const db = client.db(dbName);

          // ## quick & dirty way of assigning an "id" value
          for (var z = 0; z < result.length; z++) {
            var nro = result.slice(-1)[0].id;
          }
            nro++;
          // ##

          var query = {
            "id": nro,
            "username": req.body.username,
            "country": req.body.country,
            "date": new Date(),
            "message": req.body.message
          };
          //var query = { "username": "hello testing" };

          db.collection("demojson")
            .insertOne(query)
              client.close();
              res.redirect("/guestbook");
        }
      }
    );

    // ############
    // here it'll update but not update the guestbook view - no errors tho :P
    // it doesn't seem to matter where the render is - still it won't refresh after posting
    // maybe because of asynchronous actions
    //res.render("pages/guestbook", { collection: result, collection2: flag });
  //});
});
});


// GET delete route
app.get("/delete", function(req, res) {
  var result = getResult(function(err, result) {
    //handle err, then you can render your view
    //console.log(result);
    res.render("pages/delete", { collection: result });
  });
});


// delete body-parser POST
app.post("/delete", function(req, res) {

    const MongoClient = require("mongodb").MongoClient;

    // Connection URL
    const url = process.env.MONGOLAB_URI;

    // Database Name
    const dbName = "kouludb";

    MongoClient.connect(
      url,
      { useNewUrlParser: true },
      function(err, client) {
        if (err) {
          console.log("Unable to connect to the mongoDB server. Error:", err);
        } else {
          //console.log("Connection established to", url);
          console.log("Connection established to: demojson.json - removing");

          const db = client.db(dbName);

          // somewhere along the lines the integer value of a message id turns into
          // a String so I just parse the String quick&dirty
          // ask mika if it's something funky w/ the bodyparser settings
          //### toinen tapa
          //var id = parseInt(req.body.sel);
          // -> var query = { "id": id };
          // okay so when we get multiple values with the checkbox, they are put into an array
          //console.log(req.body.sel);
          var id = req.body.sel;
          //console.log(id); output ["5", "7"]

          if (id.length === 1) {
            //console.log(id); output 7 with Number()
            var queryOne = { "id": Number(id) };
              try {
                db.collection("demojson")
                .deleteOne(queryOne)
                  client.close();
                  res.redirect("/delete");
                  console.log("Deleted one message");
              } catch (e) {
                print(e);
              }
            } else {
                var arrayId = id.map(Number);
                var queryMany = { "id": { $in: arrayId } };
                //console.log(id); //output ["5", "7"]
                //console.log(Number(id)); //output NaN
                console.log(queryMany);
                  try {
                    db.collection("demojson")
                    .deleteMany(queryMany)
                      client.close();
                      res.redirect("/delete");
                      console.log("Deleted many messages");
                  } catch (e) {
                    print(e);
                  }
              }
          /*
          logging for troubleshooting purposes ###
          //console.log(typeof req.body.sel); // returns String
          //console.log(req.body.sel); // returns 16
          var jsonStr = JSON.stringify(req.body.sel);
          console.log(jsonStr); // output "13"
          var query = { "id": jsonStr };
          console.log(query); // output { id: ' " 13 " ' }
          //var query = { "id": 14 }; // poistaa ihan oikein
          //var query = { "username": "hello testing" };
          //console.log(req.body.sel); // antaa oikeassa muodossa - 14, 15 jne.
          */
        }
      }
    );
    // here it'll update but not update the guestbook view - no errors tho :P
    // it doesn't matter where the render() lives, it doesn't refresh after adding/deleting
    // look into its asynchronous nature
    //res.render("pages/delete", { collection: result });
      //handle err then show view
});

//### trying to do edit shit
app.post("/edit", function(req, res) {
  msg = req.body.editMsg;
  filteredMsg = msg.filter(Boolean);
  console.log(filteredMsg);
  id = req.body.editBtn;

  const MongoClient = require("mongodb").MongoClient;

  // Connection URL
  const url = process.env.MONGOLAB_URI;

  // Database Name
  const dbName = "kouludb";

  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        console.log("Unable to connect to the mongoDB server. Error:", err);
      } else {
        //console.log("Connection established to", url);
        console.log("Connection established to: demojson.json - removing");

        const db = client.db(dbName);

  if (!filteredMsg) {
    return res.status(400).send("Missing parameters");
  } else {
    var queryOne = { "id": Number(id) };
      try {
        db.collection("demojson")
        .updateOne(queryOne, { $set: { "message": filteredMsg } })
          client.close();
          res.redirect("/delete");
          console.log("Edited one message");
      } catch (e) {
        print(e);
        }
      }
    }
});
});


// ####

// movie database route
app.get("/movies", function(req, res) {
  res.render("pages/movies");
});

// movie database search by input body-parser POST
app.post("/getmovies", function(req, res) {
  //if (!req.body.title && !req.body.year && !req.body.cast && !req.body.genres) {
  if (req.body.year == "") {
    console.log("Empty search parameters");
    res.redirect("/movies");
  } else {
  //console.log(req.body.title);
  var title = req.body.title;

  var movie = getMovies(function(err, movies) {
    res.render("pages/getmovies", { collection3: movies });
  }, title);
  }
});


// ################################
function getMovies(callback, title) {

  const MongoClient = require("mongodb").MongoClient;

  // Connection URL
  const url = process.env.MONGOLAB_URI;
  // Database Name
  const dbName = "kouludb";

  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        console.log("Unable to connect to the mongoDB server. Error:", err);
      } else {
        //console.log("Connection established to", url);
        console.log("Connection established to: movies.json");

        const db = client.db(dbName);

        // empty query gives us all the users/messages
        // "title": title might work, but not /title/ - compass export to language
        // gives us this regexp expression for variables - the , "i" makes the query
        // case insensitive
        var query = { "title": new RegExp(title, "i") };
        console.log(title);

        // filter/find is left empty, sorts in ascending order (-1 for desc.)
        db.collection("movies")
          .find(query)
          .project({ "title": 1, "year": 1, "cast": 1, "genres": 1 })
          .toArray(function(err, movies) {
            if (err) throw err;
            //console.log(result);
            client.close();
            callback(err, movies);
          });
      }
    }
  );
}

function getResult(callback) {
  const MongoClient = require("mongodb").MongoClient;

  // Connection URL
  const url = process.env.MONGOLAB_URI;

  // Database Name
  const dbName = "kouludb";

  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        console.log("Unable to connect to the mongoDB server. Error:", err);
      } else {
        //console.log("Connection established to", url);
        console.log("Connection established to: demojson.json");

        const db = client.db(dbName);

        // empty query gives us all the users/messages
        var query = { };

        // filter/find is left empty, sorts in ascending order (-1 for desc.)
        db.collection("demojson")
          .find(query)
          .sort({ id: 1 })
          .toArray(function(err, result) {
            if (err) throw err;
            //console.log(result);
            client.close();
            callback(err, result);
          });
      }
    }
  );
}

// ################################

function getFlags(callback) {
  const MongoClient = require("mongodb").MongoClient;

  // Connection URL
  const url = process.env.MONGOLAB_URI;

  // Database Name
  const dbName = "kouludb";

  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        console.log("Unable to connect to the mongoDB server. Error:", err);
      } else {
        //console.log("Connection established to", url);
        console.log("Connection established to: flagdata.json");

        const db = client.db(dbName);

        // getting all the data
        var query = { };

        // there's really no need to project (?) or maybe it wants to send the mongodb "_id"
        // let's sort the countries alphabetically - so "ascending" by "name"
        db.collection("flagdata")
          .find(query)
          .sort({ name: 1 })
          .project( {"flag": 1, "name": 1} )
          .toArray(function(err, flag) {
            if (err) throw err;
            //console.log(result);
            client.close();
            callback(err, flag);
          });
      }
    }
  );
}

app.listen(8081);
console.log("8081 is the magic port");
