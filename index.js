var express = require('express');
var app = express();
var path = require('path');
var firebase = require("firebase");
var fs = require('fs');
var markdown = require('markdown').markdown;
var admin = require("firebase-admin");
var bodyParser = require('body-parser');
var admin = require("firebase-admin");
var markdown = require( "markdown" ).markdown;

var serviceAccount = require("sdk/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ideaboxaa.firebaseio.com"
});

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

app.get('/logout',function (req,res) {
	firebase.auth().signOut()
   .then(function() {
      res.redirect('/signin');
   });
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
	var email = req.body.email;
	var password = req.body.password;
	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then(userData => { 
	var userId = userData.uid;
	var data = 
	{
		    username: nam,
		    phone : phone
  		};
		  	firebase.database().ref('user/'+userId ).set(data);
		  	res.send(userData.uid);
			

	})
	.catch(function(error) {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  console.log(error.code);
		  //res.send(errorCode + "  <a href='/'>Go Back</a>");			
		  res.send(errorMessage);			
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
		}).
		catch(function(error) {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  res.send(errorCode);
		  
});
	
});

//routng for posts

//add idea to data base
app.post('/addidea/',function (req,res) {
	var title = req.body.title;
	var category = req.body.category;
	var description = req.body.description;
	var user = firebase.auth().currentUser;
	var userToken = user.uid;
	var time = req.body.time;
	var data = 
	{		userid: userToken,
		    title: title,
		    category : category,
		    description: description,
		    upvote: 0,
		    downvote: 0,
		    date: time,
		    comment : { }
  		};
		  	//firebase.database().ref('user/'+userId ).set(data);
		  	//var postsRef = firebase.database().ref.child("user/ideas");
		  	//postsRef.push().set(data)
		  	firebase.database().ref('ideas/').push().set(data)
		  	.then(userData => { 
				res.send("Added");
			})
		  	.catch(function(error) {
			  var errorCode = error.code;
			  var errorMessage = error.message;
			  console.log(error.code);		
			  res.send(errorMessage);			
	});

	
});

//add idea to data base

//routing for getting user
	app.post('/getuser',function (req,res) {
		var userIdd = req.body.tok;
		//console.log(userIdd);
		var db = admin.database();
		var ref = db.ref("/user").orderByKey().equalTo(userIdd);;
	ref.on("value", function(snapshot) {
  		console.log(snapshot.val());
  		res.send(snapshot.val());
	
	}, function (errorObject) {
  		console.log("The read failed: " + errorObject.code);
  		res.send("The read failed: " + errorObject.code);
});
		
});
//routing for getting user

//routing for getting ideas
	app.post('/getideas',function (req,res) {
		var db = admin.database();
		var ref = db.ref("/ideas").orderByKey();
	ref.once("value", function(snapshot) {
  		//console.log(snapshot.val());
  		res.send(snapshot.val());
	
	}, function (errorObject) {
  		//console.log("The read failed: " + errorObject.code);
  		//res.send("The read failed: " + errorObject.code);
});
		
});
//routing for getting ideas

//routing for votes
app.post('/vote',function (req,res) {
	var voteType = req.body.v;
	var ideaId = req.body.ideaId;
	var vote = req.body.vote;
	var user = firebase.auth().currentUser;
	var uidd = user.uid;
	
	if (voteType =='up'){
		var data = 
			{		
		    upvote: vote,
		    } 
		firebase.database().ref('ideas/'+ideaId).update(data)
		.then(userData => { 
				console.log("Updated");
				res.send("voted");
			})
		
	}
	else{
		var data = 
			{		
		    downvote: vote,
		    } 
		firebase.database().ref('ideas/'+ideaId).update(data)
		.then(userData => { 
				//return res.redirect('/idea');
				console.log("Updated");
				res.send("voted");
			})

	}
		
});

//routing for votes
//routing for getting idea poster
	app.post('/ideaposter',function (req,res) {
		var userIdd = req.body.tok;
		//console.log(userIdd);
		var db = admin.database();
		var ref = db.ref("/user").orderByKey().equalTo(userIdd);;
		ref.on("value", function(snapshot) {
  		console.log(snapshot.val());
  		res.send(snapshot.val());
	
	}, function (errorObject) {
  		console.log("The read failed: " + errorObject.code);
  		res.send("The read failed: " + errorObject.code);
	});
		
});
//routing for getting user idea poster

//routing for adding comments to ideas
app.post('/addcomment',function (req,res) {
		var commenter = req.body.commenter;
		var comment = req.body.comment;
		var date = req.body.date;
		var ideaId = req.body.ideaId;
		var data = 
			{		
		    	comment: comment, time: date, commenter:commenter
		    } 
		firebase.database().ref('ideas/'+ideaId+'/comment').push().set(data)
		.then(userData => { 
				//return res.redirect('/idea');
				console.log("Updated");
				res.send("Added");
			})
		//res.send(userToken + comment + date + ideaId);
		
		
});

//routing for getting comments to ideas

//routing for markDown
app.post('/markdown',function (req,res) {
		var word = req.body.txt;
		res.send(word);
});

//routing for markDown