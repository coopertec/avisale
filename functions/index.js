const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);
const db = firebase.firestore();

function getFacts() {

    const ref= db.collection("facts");
    return ref.get();


}

function getOneFact() {
    var ref = db.collection("facts").doc("ATt0JolCVYtVvciQdb5T");

    ref.get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            return doc;

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

}

const app = express();
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');



app.get('/', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');

    var docRef = getFacts().then((snapshot) => {
        /*snapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
        });*/
        // https://stackoverflow.com/a/58494195/3369131
        const facts = snapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() }
          });
        response.render('index',{facts});
    });
});

app.get('/facts.json', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');

    var docRef = getFacts().then((snapshot) => {
        /*snapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
        });*/
        // https://stackoverflow.com/a/58494195/3369131
        const facts = snapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() }
          });
        response.json(facts);
    });
});


/*
app.get('/timestamp', (request, response) => {
    response.send(`${Date.now()}`);
});

app.get('/timestamp-cached', (request, response) => {
    response.set('Cache-Control','public, max-age=300, s-maxage=600');
    response.send(`${Date.now()}`);
});*/

exports.app = functions.https.onRequest(app);