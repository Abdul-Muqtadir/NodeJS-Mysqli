const mysql = require('mysql');
const express = require('express');
const bodyparser = require('body-parser');
var app = express();
//Configuring express server
app.use(bodyparser.json());
var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hello',
    multipleStatements: true
    });
    mysqlConnection.connect((err)=> {
        if(!err){
        console.log('Connection Established Successfully');
        app.post('/insert', (req, res) => {
            let usr = req.body;
            console.log(usr);
            var sql = `INSERT INTO user (user_name, user_pass,user_like) VALUES ('${usr.userName}', '${usr.userPass}','${usr.userLike}')`;
            mysqlConnection.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
               });
            // res.send('<p>hello</p>');
           console.log("hello");
            });

            app.delete('/deleteUsers/:id', (req, res) => {
                mysqlConnection.query('DELETE FROM user WHERE user_id = ?', [req.params.id], (err, rows, fields) => {
                if (!err)
                res.send('Learner Record deleted successfully.');
                else
                console.log(err);
                })
                });
        }
        else
        console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
        });


        const port = process.env.PORT || 8080;
        app.listen(port, () => console.log(`Listening on port ${port}..`));