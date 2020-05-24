const fs = require('fs');
const path = require('path');
const express = require('express');
const { notes } = require('./db/db');

// to communicate with Heroku we need to tell the app to communicate with the following environment variable
const PORT = process.env.PORT || 3001;

// set up express app
const app = express();

// data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


// routes
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});


// filtering the requested data by title, text or id
function filterByQuery(query, notesArray) {
    let filteredResults = notesArray;
    if (query.title) {
        filteredResults = filteredResults.filter(note => note.title === query.title);
    }
    if (query.text) {
        filteredResults = filteredResults.filter(note => note.text === query.text);
    }
    if (query.id) {
        filteredResults = filteredResults.filter(note => note.id === query.id);
    }
    return filteredResults;
};


// function takes a new note, pushes the note into the notesArray and write a new JSON file
function createNewNote(body, notesArray) {
    const note = body;
    notesArray.push(note);
    
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
    );
  
    return note;
};


// validating that the typeof data is expected; string in this app
function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
        return false;
    }
    if (!note.text || typeof note.text !== 'string') {
        return false;
    }
    if (!note.id || typeof note.id !== 'string') {
        return false;
    }
    return true;
};


// links the JSON file to the front-end browser
app.get('/api/notes', (req, res) => {
    let results = notes;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});


// add a note to the db.json file utilizing the app.post method as well as createNewNote
app.post('/api/notes', (req, res) => {
    // set ID based on what the next index of the array will be
    req.body.id = notes.length.toString();

    // if any data in req.body is incorrect, send 400 error back
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted');
    } else {
        const note = createNewNote(req.body, notes);
        res.json(note);
    }
});


// remove a note via ID and then write a new file
app.delete('/api/notes/:id', function (req, res) {
    var id = req.params.id;
    fs.readFileSync('./db/db.json', (err, data) => {
        if (err) throw err;
        notes = JSON.parse(data);
    });

    for (var i = 0; i < notes.length; i++) {
        if (notes[i].id == id) {
        notes.splice(i, 1);   

            for (var i = 0; i < notes.length; i++) {
                notes[i].id = i.toString();  
            }
            break;
        }
    }

  fs.writeFile('./db/db.json', JSON.stringify({ notes: notes }, null, 2), (err) => {
      if (err) throw err;
  });

  res.json(id);
});


// the .listen() method allows the server (express) to "listen" for the requests
app.listen(PORT, () => {
    console.log(`API server now at port ${PORT}!`);
});