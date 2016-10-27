const firebase = require('firebase');
const randomWords = require('random-words');
const nodemailer = require('nodemailer');
const fs = require('fs');
var csv = require("fast-csv");


const config = {
	    apiKey: "AIzaSyCRlBbgvXtULfnyfW0tzd-7AoSypxq9n0M",
	    authDomain: "ggdb-af77a.firebaseapp.com",
	    databaseURL: "https://ggdb-af77a.firebaseio.com",
	    storageBucket: "gs://ggdb-af77a.appspot.com",
	  };
firebase.initializeApp(config);



csv.fromPath(process.argv[2])
	.on('data', function(data) {
		console.log(data[0]);
		const userObj = {};
	})
	.on('end', function() {
		console.log('done');
	})


function createUser(userObj) {
	// generate a password
	userObj.pswd = randomWords(2).join('');

	// create a user
	firebase.auth().createUserWithEmailAndPassword(userObj.email, userObj.pswd).then(function() {
		console.log('user created successfully');
		updateUser(userObj);
	}, function(error) {
		if (error) {
			console.log(error.code, error.message);
			process.exit(1);
		}  
	});
}

function updateUser(userObj) {
	const user = firebase.auth().currentUser;

	firebase.database().ref('users/' + user.uid).set({
    email: userObj.email,
    name: userObj.name,
    season : userObj.season,
    episode: userObj.episode,
  }).then(function() {
			console.log('user updated successfully');
			sendMail(userObj);
		}, function() {
			console.log('unable to update user');
			process.exit(1);	
		});
}

function sendMail(userObj) {
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'ggdb.info@gmail.com',
			pass: 'lukesdiner'
		}
	});

	const mailOptions = {
		from: 'ggdb.info@gmail.com',
		to: userObj.email,
		subject: 'Your GGDB contributor credentials',
		text: `Thanks for being a contributor! You can now sign in with your email and this password: ${userObj.pswd}. You can now add/edit any entry in Season ${userObj.season}, Episode ${userObj.episode}. To get started go to http://gg-db.com/guide. Good luck and thanks for your help. (Do not reply this email. It will not work. Contact info is in the guide at the link above)` 
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log("Error while sending email.", error);
			// ** TO DO ** delete user and start over
		}
		console.log('email sent.');
		firebase.auth().signOut()
		addToFile(userObj);
	});
}


function addToFile(userObj) {
	const dataString = `${userObj.season},${userObj.episode},${userObj.name},${userObj.email},${userObj.pswd}\n`;
	fs.appendFile('users.csv', dataString, 'utf8', (err) => {
		if (err) {
			console.log("Error writing to file. Add manually. Pswd = " + pswd);
		} else  {
			console.log("users.csv updated");
			process.exit(0);
		}
	});
}
