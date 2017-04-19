var express = require('express');
var app = express();
var path = require('path');
var firebase = require("firebase");
var fs = require('fs');
var markdown = require('markdown').markdown;


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

app.get('/idea',function (req,res) {
	firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    res.sendFile(path.join(__dirname+'/public/idea.html'))	;
  } else {
    res.sendFile(path.join(__dirname+'/public/signin.html'))	;
  }
});
	
});

//routng for gets

//routng for posts
app.post('/processsignup',function (req,res) {
	var nam = req.body.name;
	var phone = req.body.phone;
	var imageUrl = req.body.img;
	var email = req.body.email;
	var password = req.body.password;
	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then(userData => { 
	var userId = userData.uid;
	var data = 
	{
		    username: nam,
		    //profile_picture : imageUrl,
		    phone : phone
  		};
		  	firebase.database().ref('user/'+userId ).set(data).
		  	catch(function(error) {
		  		 console.log(error.code);
		  	}); 
		
		// console.log(userData);
		//res.send(userId);
	})
	.catch(function(error) {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  console.log(error.code);
		  res.send(errorCode + "  <a href='/'>Go Back</a>");			
	});
		
});

app.post('/processsignin',function (req,res) {
	var password = req.body.password;
	var email = req.body.email;
	firebase.auth().signInWithEmailAndPassword(email, password) 
	.then(userData => { 
		//var file =  fs.readFileSync(__dirname +'/public/idea.html', "utf8");
		 //console.log( markdown.toHTML( "Hello *World*!" ) );
		 //res.send(markdown.toHTML( "Hello *World*!" ) )	;
		 //res.send(file);
		 //res.sendFile(path.join(__dirname+'/public/idea.html'))	;
		 res.send(userData.uid);

	})
	.catch(function(error) {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  res.send(errorCode);
		  
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

//add idea to data base
app.post('/addidea/',function (req,res) {
	var title = req.body.title;
	var category = req.body.category;
	var description = req.body.description;
	res.send( title + category + description);
	
});

//add idea to data base