const firebase = require('firebase');

const config = {
	    apiKey: "AIzaSyAVirRMeYf01ez2zd8tpUJ4yS1xgtjZkU8",
	    authDomain: "ggdb-af77a.firebaseapp.com",
	    databaseURL: "https://ggdb-af77a.firebaseio.com",
	    storageBucket: "gs://ggdb-af77a.appspot.com",
	  };
firebase.initializeApp(config);

console.log(process.argv);

const email = process.argv[2];
const season = process.argv[3];
const episode = process.argv[4];

// generate a password
// create a user
// assign the season/episode permissions
// send an email with the email, password, season, and episode
// append csv file
