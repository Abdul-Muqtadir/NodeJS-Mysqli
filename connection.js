// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/taskdb',{ useNewUrlParser: true },{ useUnifiedTopology: true });
// mongoose.connection.once('open',function(){
//         console.log('Connected Successfully');
// }).on('error',function(error){
//     console.log('error is:', error);
// });

const Express = require("express");
const BodyParser = require("body-parser");
const { Collection } = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb://localhost/taskdb";
const DATABASE_NAME = "taskdb";

var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var database, UserCollection, TaskCollection;

app.listen(5000, () => {
  MongoClient.connect(
    CONNECTION_URL,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        throw error;
      }
      database = client.db(DATABASE_NAME);
      UserCollection = database.collection("users");
      TaskCollection = database.collection("tasks");
      console.log("Connected to `" + DATABASE_NAME + "`!");
      //insert Api
      app.post("/assignTasks", (request, response) => {
        console.log(request.body);
        UserCollection.insertOne(request.body, (error, result) => {
          if (error) {
            return response.status(500).send(error);
          }

          response.send(result.result);
        });
      });
      //insert Task
      app.post("/addTask", (request, response) => {
        var task = request.body;
        if (
          (task.title != null || task.title != "") &&
          (task.description != null || task.description != "")
        ) {
          console.log();
          var myquery = { title: task.title };
          TaskCollection.find(myquery).toArray(function (err, results) {
            if (err) throw err;
            if (results.length === 0) {
              TaskCollection.insertOne(task, (error, result) => {
                if (error) {
                  return response.status(500).send(error);
                }
                response.status(200).send("1 task added");
              });
            } else {
              response.status(300).send("task already exists");
            }
          });
        } else {
          response.status(400).send("task not added");
        }
      });
      //View Tasks
      app.get("/getTasks", (request, response) => {
        console.log(request.body);
        TaskCollection.find({}).toArray(function (err, results) {
          console.log(results);
          // output all records
          response.send(results);
        });
      });
      //remove Task Api
      app.delete("/removeTask", (request, response) => {
        console.log(request.body);
        var myquery = { title: request.body.title };
        TaskCollection.deleteOne(myquery, function (err, obj) {
          if (err) throw err;
          console.log("1 document deleted");
          var myquery = { TaskTitle: request.body.title };
          var newvalues = {
            $set: {
              TaskTitle: "",
            },
          };
          UserCollection.updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            response.status(201).send("1 document updated");
            console.log("1 document updated");
          });
        });
      });
      //Update Task Api
      app.put("/updateTask", (request, response) => {
        var task = request.body;
        if (
          (task.oldtitle != null || task.oldtitle != "") &&
          (task.newtitle != null || task.newtitle != "") &&
          (task.description != null || task.description != "")
        ) {
          var myquery = { title: task.title };
          TaskCollection.find(myquery).toArray(function (err, results) {
            if (err) throw err;
            if (results.length === 0) {
              var myquery = { title: request.body.oldtitle };
              var newvalues = {
                $set: {
                  title: request.body.newtitle,
                  description: request.body.description,
                },
              };
              TaskCollection.updateOne(myquery, newvalues, function (err, res) {
                if (err) throw err;
                response.status(201).send("1 document updated");
                console.log("1 document updated");
              });
            } else {
              response.status(300).send("task already exists");
            }
          });
        } else {
          response.status(400).send("task not updated");
        }
      });
      //add User Api
      app.post("/addUser", (request, response) => {
        var user = request.body;
        if (user.UserName != null || user.UserName != "") {
          console.log();
          var myquery = { UserName: user.UserName };
          UserCollection.find(myquery).toArray(function (err, results) {
            if (err) throw err;
            if (results.length === 0) {
              UserCollection.insertOne(user, (error, result) => {
                if (error) {
                  return response.status(500).send(error);
                }
                response.status(200).send("1 User added");
              });
            } else {
              response.status(300).send("user already exists");
            }
          });
        } else {
          response.status(400).send("user not added");
        }
      });
      //get User Api
      app.get("/getUsers", (request, response) => {
        console.log(request.body);
        UserCollection.find({}).toArray(function (err, results) {
          console.log(results);
          // output all records
          response.send(results);
        });
      });

      //assign Task Api
      app.put("/assignTask", (request, response) => {
        var obj = request.body;
        if (
          (obj.UserName != null || obj.UserName != "") &&
          (obj.TaskTitle != null || obj.TaskTitle != "")
        ) {
          var myquery = { title: obj.TaskTitle };
          var ress = TaskCollection.find(myquery);
          ress.forEach(function (taskId) {
            //access all the attributes of the document here
            var taskid = taskId._id;
            var myquery = { UserName: obj.UserName };
            var newvalues = {
              $set: {
                TaskTitle: taskid,
              },
            };
            UserCollection.updateOne(myquery, newvalues, function (err, res) {
              if (err) throw err;
              response.status(201).send("1 document updated");
              console.log("1 document updated");
            });
          });
        } else {
          response.status(400).send("task not updated");
        }
      });

      ////getAssignedTasks
      app.get("/getAssignedTasks", (request, response) => {
        UserCollection.aggregate([
          { $lookup:
             {
               from: 'tasks',
               localField: 'TaskTitle',
               foreignField: '_id',
               as: 'userTasks'
             }
           }
          ]).toArray(function(err, res) {
          if (err) throw err;
          // res.map((item)=>{console.log(item);})
           var test = res.filter(function (ele) {
            return ele.userTasks.length!=0;
            
          });
          console.log(test);
          response.send(test);
        });
      })
      //delete Api
      app.delete("/removeAssignment", (request, response) => {
        console.log(request.body);
        var myquery = { userName: request.body.userName };
        UserCollection.deleteOne(myquery, function (err, obj) {
          if (err) throw err;
          res.status(201).send("1 document Deleted");
        });
      });
      //View Api
      app.get("/getUsersTasks", (request, response) => {
        console.log(request.body);
        collection.find({}).toArray(function (err, results) {
          console.log(results);
          // output all records
          response.send(results);
        });
      });
      //Update Api
      app.put("/UpdateUserTask", (request, response) => {
        console.log(request.body);
        var myquery = { userName: request.body.userName };
        var newvalues = { $set: { userTask: request.body.userTask } };
        collection.updateOne(myquery, newvalues, function (err, res) {
          if (err) throw err;
          console.log("1 document updated");
        });
      });
    }
  );
});
