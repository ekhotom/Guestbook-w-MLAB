
const express = require("express");
const app = express();

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
    var flag = getFlags(function(err, flag) {
    //handle err, then you can render your view

    const MongoClient = require("mongodb").MongoClient;

    // Connection URL
    const url = "mongodb://user:perkelE123@ds026018.mlab.com:26018/kouludb";

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
        }
      }
    );
    // ############
    // here it'll update but not update the guestbook view - no errors tho :P
    // it doesn't seem to matter where the render is - still it won't refresh after posting
    // maybe because of asynchronous actions
    res.render("pages/guestbook", { collection: result, collection2: flag });
  });
});
});

// delete route
app.get("/delete", function(req, res) {
  var result = getResult(function(err, result) {
    //handle err, then you can render your view
    //console.log(result);
    res.render("pages/delete", { collection: result });
  });
});

app.listen(8081);
console.log("8081 is the magic port");

// delete body-parser POST
app.post("/delete", function(req, res) {
  var result = getResult(function(err, result) {
    //handle err, then you can render your view

    const MongoClient = require("mongodb").MongoClient;

    // Connection URL
    const url = "mongodb://user:perkelE123@ds026018.mlab.com:26018/kouludb";

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
          var query = { "id": Number(req.body.sel) };

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

          try {
            db.collection("demojson")
            .deleteOne(query)
              client.close();
          } catch (e) {
            print(e);
          }
        }
      }
    );
    // here it'll update but not update the guestbook view - no errors tho :P
    // it doesn't matter where the render() lives, it doesn't refresh after adding/deleting
    // look into its asynchronous nature
    //res.render("pages/delete", { collection: result });
    res.render("pages/delete", { collection: result });
});
});

// movie database route
app.get("/movies", function(req, res) {
  res.render("pages/movies");
});

// movie database search by input body-parser POST
/*
app.post("/movies", function(req, res) {
  const MongoClient = require("mongodb").MongoClient;
  // Connection URL
  //const url = "mongodb://localhost:27017/";
  const url = "mongodb://user:perkelE123@ds026018.mlab.com:26018/kouludb";

  // Database Name
  const dbName = "kouludb";
  const collectionName = "movies";

  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        console.log("Unable to connect to the mongoDB server. Error:", err);
      } else {
        console.log("Connection established to movies.json");

        const db = client.db(dbName);

        var query = { "title": /req.body.title/ };
        db.collection(collectionName)
          .find(query)
          .limit(6)
          .toArray(function(err, shit) {
            if (err) {
              console.log(err);
              res.status("400").send({ error: err });
            } else if (shit.length) {
              //console.log("Found:", result);
              res.render("pages/movies", { movies: shit });
            } else {
              console.log('No document(s) found with defined "find" criteria!');
              res.status("400").send({ error: "No document(s) found" });
            }
            //Close connection
            client.close();
          });
      } // else {
    } // function
  );
});
*/

// ################################

function getResult(callback) {
  const MongoClient = require("mongodb").MongoClient;

  // Connection URL
  const url = "mongodb://user:perkelE123@ds026018.mlab.com:26018/kouludb";

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
  const url = "mongodb://user:perkelE123@ds026018.mlab.com:26018/kouludb";

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
