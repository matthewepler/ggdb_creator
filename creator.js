const firebase = require('firebase');
const randomWords = require('random-words');
const nodemailer = require('nodemailer');
const fs = require('fs');

const config = {
	    apiKey: "AIzaSyCRlBbgvXtULfnyfW0tzd-7AoSypxq9n0M",
	    authDomain: "ggdb-af77a.firebaseapp.com",
	    databaseURL: "https://ggdb-af77a.firebaseio.com",
	    storageBucket: "gs://ggdb-af77a.appspot.com",
	  };
firebase.initializeApp(config);


const email = process.argv[2];
const name = process.argv[3]

const permString = process.argv[4].split('.');
const season = permString[0];
const episode = permString[1];

// generate a password
const pswd = randomWords(2).join('');

// create a user
if (email && name && season && episode) {
	firebase.auth().createUserWithEmailAndPassword(email, pswd).then(function() {
		console.log('user created successfully');
		updateUser();
	}, function(error) {
		if (error) {
			console.log(error.code, error.message);
			process.exit(1);
		}  
	});
}

function updateUser() {
	const user = firebase.auth().currentUser;

	firebase.database().ref('users/' + user.uid).set({
    	email: email,
    	name: name,
    	episodes: [episode],
  	}).then(function() {
			console.log('user updated successfully');
			sendMail();
		}, function() {
			console.log('unable to update user');
			process.exit(1);	
		});
}

function sendMail() {
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'ggdb.info@gmail.com',
			pass: 'lukesdiner'
		}
	});

	const mailOptions = {
		from: 'ggdb.info@gmail.com',
		to: email,
		subject: 'Your GGDB contributor credentials',
		text: `Thanks for being a contributor! You can now sign in with your email and this password: ${pswd}. You can now add/edit any entry in Season ${season}, Episode ${episode}. To get started go to http://gg-db.com/guide. Good luck and thanks for your help!` 
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log("Error while sending email.", error);
			// ** TO DO ** delete user and start over
		}
		if (info) {
			console.log("info from sendMail: ", info);
		}
		console.log('email sent.');
		firebase.auth().signOut()
		addToFile();
	});
}


function addToFile() {
	const dataString = `${season},${episode},${name},${email},${pswd}\n`;
	fs.appendFile('users.csv', dataString, 'utf8', (err) => {
		if (err) {
			console.log("Error writing to file. Add manually. Pswd = " + pswd);
		} else  {
			console.log("users.csv updated");
			process.exit(0);
		}
	});
}
