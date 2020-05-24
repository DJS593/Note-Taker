const fs = require('fs');
const path = require('path');
const express = require('express');
//require('dotenv').config()

// to communicate with Heroku we need to tell the app to communicate with the following environment variable
const PORT = process.env.PORT || 3001;

// the two codes below are needed to run express

const app = express();

/* the following is needed so the server recognizes the incoming POST as JSON */
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
app.use(express.static('public'));



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

// function deleteNote(body, notesArray) {
//   const note = body;
//   notesArray.push(note);
//   fs.writeFileSync(
//     path.join(__dirname, './db/db.json'),
//     JSON.stringify({ notes: notesArray }, null, 2)
//   );

//   return note;
// }


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
}



app.get('/api/notes/:id', (req, res) => {
  const result = findById(req.params.id, notes);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});

app.get('/api/notes', (req, res) => {
  let results = notes;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});




app.post('/api/notes', (req, res) => {
  // set id based on what the next index of the array will be
  req.body.id = notes.length.toString();

  // if any data in req.body is incorrect, send 400 error back
  if (!validateNote(req.body)) {
    res.status(400).send('The note is not properly formatted');
  } else {
    const note = createNewNote(req.body, notes);
    res.json(note);
  }
});




app.delete("/api/notes/:id", function (req, res) {
  var id = req.params.id;
  fs.readFileSync('./db/db.json', (err, data) => {
      if (err) throw err;
      notes = JSON.parse(data);
  });

  for (var i = 0; i < notes.length; i++) {

      if (notes[i].id == id) {
          console.log("Deleting ==============");
          console.log(notes[i]);
          notes.splice(i, 1);
      }
  }

  fs.writeFile('./db/db.json', JSON.stringify({ notes: notes}, null, 2), (err) => {
      if (err) throw err;
      console.log('The file was updated!');
  });

  res.json(id);
})




app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});



// the .listen() method allows the server to "listen" for the requests

app.listen(PORT, () => {
  console.log(`API server now at port ${PORT}!`);
});