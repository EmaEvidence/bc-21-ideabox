		var express = require('express');
		var app = express();
		var path = require('path');
		var firebase = require("firebase");
		var fs = require('fs');
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
		app.set('port', process.env.PORT || 3000);
		app.listen(app.get('port'));

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
			//firebase.auth().signOut();
      		//res.sendFile(path.join(__dirname+'/public/signin.html'))	;
      		firebase.auth().signOut().then(function() {
			  console.log('Signed Out');
			  res.sendFile(path.join(__dirname+'/public/signin.html'))	;
			}, function(error) {
			  console.error('Sign Out Error', error);
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
			let nam = req.body.name;
			let phone = req.body.phone;
			let email = req.body.email;
			let password = req.body.password;
			firebase.auth().createUserWithEmailAndPassword(email, password)
			.then(userData => { 
				let userId = userData.uid;
				let data = {
		    					username: nam,
		    					phone : phone
  							};
		  	firebase.database().ref('user/'+userId ).set(data);
		  		res.send(userData.uid);
			})
			.catch(function(error) {
		  		let errorCode = error.code;
		  		let errorMessage = error.message;
		  		console.log(error.code);
		  		res.send(errorMessage);			
			});
		});


		app.post('/processsignin',function (req,res) {
			let password = req.body.password;
			let email = req.body.email;
			firebase.auth().signInWithEmailAndPassword(email, password) 
			.then(userData => { 
		 	res.send(userData.uid);
			})
			.catch(function(error) {
		  	let errorCode = error.code;
		  	let errorMessage = error.message;
		  	res.send(errorCode);
			});
		});


		app.post('/resetpass',function (req,res) {
			let email = req.body.email;
			let auth = firebase.auth();
			auth.sendPasswordResetEmail(email).then(function() {
			}, function(error) {
			}).
			catch(function(error) {
		  		let errorCode = error.code;
		  		let errorMessage = error.message;
		  		res.send(errorCode);
		  
			});
		});

//routng for posts

//add idea to data base
		app.post('/addidea/',function (req,res) {
			let title = req.body.title;
			let category = req.body.category;
			let description = req.body.description;
			let user = firebase.auth().currentUser;
			let userToken = user.uid;
			let time = req.body.time;
			let data = {
							userid: userToken,
		    				title: title,
		    				category : category,
		    				description: description,
		    				upvote: 0,
		    				downvote: 0,
		    				date: time,
		    				comment : { }
  						};
		  	firebase.database().ref('ideas/').push().set(data)
		  	.then(userData => { 
				res.send("Added");
			})
		  	.catch(function(error) {
				let errorCode = error.code;
				let errorMessage = error.message;
			 	console.log(error.code);		
				res.send(errorMessage);			
			});	
		});

//add idea to data base

//routing for getting user
		app.post('/getuser',function (req,res) {
			let userIdd = req.body.tok;
			let db = admin.database();
			let ref = db.ref("/user").orderByKey().equalTo(userIdd);;
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
			let db = admin.database();
			let ref = db.ref("/ideas").orderByKey();
			ref.once("value", function(snapshot) {
  				res.send(snapshot.val());
			}, function (errorObject) {
			});
		
		});
//routing for getting ideas

//routing for votes
		app.post('/vote',function (req,res) {
			let voteType = req.body.v;
			let ideaId = req.body.ideaId;
			let vote = req.body.vote;
			let user = firebase.auth().currentUser;
			let uidd = user.uid;
			if (voteType =='up'){
				let data = {		
		    					upvote: vote,
		    				} 
			firebase.database().ref('ideas/'+ideaId).update(data)
			.then(userData => { 
				console.log("Updated");
				res.send("voted");
			})	
			}
			else{
				let data = {		
		    		downvote: vote,
		    	} 
			firebase.database().ref('ideas/'+ideaId).update(data)
				.then(userData => { 
				console.log("Updated");
				res.send("voted");
			})
			}
		});

//routing for votes
//routing for getting idea poster
		app.post('/ideaposter',function (req,res) {
			let userIdd = req.body.tok;
			let db = admin.database();
			let ref = db.ref("/user").orderByKey().equalTo(userIdd);;
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
			let commenter = req.body.commenter;
			let comment = req.body.comment;
			let date = req.body.date;
			let ideaId = req.body.ideaId;
			let data = {		
		    				comment: comment, time: date, commenter:commenter
		    			}; 
			firebase.database().ref('ideas/'+ideaId+'/comment').push().set(data)
				.then(userData => { 
				console.log("Updated");
				res.send("Added");
			})
		});

//routing for getting comments to ideas
