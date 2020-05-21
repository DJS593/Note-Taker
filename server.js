const fs = require('fs');
const path = require('path');

// to communicate with Heroku we need to tell the app to communicate with the following environment variable
const PORT = process.env.PORT || 3001;

// the two codes below are needed to run express
const express = require('express');
const app = express();

/* the following is needed so the server recognizes the incoming POST as JSON */
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());



const { notes } = require('./db/db');



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
}


function findById(id, notesArray) {
  const result = notesArray.filter(note => note.id === id)[0];
  return result;
}




function createNewNote(body, notesArray) {
  const note = body;
  notesArray.push(note);
  fs.writeFileSync(
      path.join(__dirname, './db/db.json'),
      JSON.stringify({ notes: notesArray }, null, 2)
  );
  
  return note;
}

function validateNote(note) {
  if (!note.title || typeof note.title !== 'string') {
    return false;
  }
  if (!animal.text || typeof animal.text !== 'string') {
    return false;
  }
  if (!animal.id || typeof animal.id !== 'string') {
    return false;
  }
  return true;
}



app.get('/api/notes', (req, res) => {
  let results = notes;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});

app.get('/api/notes/:id', (req, res) => {
  const result = findById(req.params.id, notes);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});


app.post('/api/animals', (req, res) => {
  // set id based on what the next index of the array will be
  req.body.id = animals.length.toString();

  // if any data in req.body is incorrect, send 400 error back
  if (!vadidateNote(req.body)) {
    res.status(400).send('The note is not properly formatted');
  } else {
    const note = createNewNote(req.body, notes);
    res.json(note);
  }
});


// the .listen() method allows the server to "listen" for the requests

app.listen(PORT, () => {
  console.log(`API server now at port ${PORT}!`);
});