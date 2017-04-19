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

//routng for gets
app.get('/',function (req,res) {
	res.sendFile(path.join(__dirname+'/public/home.html'))	;
});

app.get('/signin',function (req,res) {
	res.sendFile(path.join(__dirname+'/public/signin.html'))	;
});

app.get('/passreset',function (req,res) {
	res.sendFile(path.join(__dirname+'/public/passrest.html'))	;
});

//routng for gets

//routng for posts
app.post('/processsignup',function (req,res) {
	var nam = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then(userData => { 
		 res.sendFile(path.join(__dirname+'/public/idea.html'))	;
	})
	.catch(function(error) {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  res.send(errorCode + "  <a href='/'>Go Back</a>");			
	});
	//console.log(email + "" + password);
		
});

app.post('/processsignin',function (req,res) {
	var password = req.body.password;
	var email = req.body.email;
	firebase.auth().signInWithEmailAndPassword(email, password) 
	.then(userData => { 
		 res.sendFile(path.join(__dirname+'/public/idea.html?y=111'))	;
	})
	.catch(function(error) {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  res.send(errorCode + "  <a href='/'>Go Back</a>");
		  
});
	 //res.send('Request recieved ' + email + password)	;
});

app.post('/resetpass',function (req,res) {
	var email = req.body.email;
	var auth = firebase.auth();
	auth.sendPasswordResetEmail(email).then(function() {
		}, function(error) {
		});
	
});

//routng for posts