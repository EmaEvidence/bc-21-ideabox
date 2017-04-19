var express = require('express');
var app = express();
var path = require('path');
var firebase = require("firebase");


	var config = {
    apiKey: "AIzaSyBCyb7h4HYMrrJsJuB5ElQPBjSEDtkZAXY",
    authDomain: "ideaboxaa.firebaseapp.com",
    databaseURL: "https://ideaboxaa.firebaseio.com",
    projectId: "ideaboxaa",
    storageBucket: "ideaboxaa.appspot.com",
    messagingSenderId: "536995907101"
  };
  firebase.initializeApp(config);
  var database = firebase.database();

app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000);

app.get('/',function (req,res) {
	res.sendFile(path.join(__dirname+'/public/home.html'))	;
});

app.get('/signin',function (req,res) {
	res.sendFile(path.join(__dirname+'/public/signin.html'))	;
});

app.post('/processsignup',function (req,res) {
	var nam = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	console.log(email + "" + password);
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  var user = firebase.auth().currentUser;
		  res.send('Request recieved ' + nam + email + password + errorMessage + user)	;
		
	});
		
});

app.post('/processsignin',function (req,res) {
	var password = req.body.password;
	var email = req.body.email;
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  res.send('Request recieved ' + email + password + errorCode)	;
		  // ...
});
	
});