const express = require('express');
const app = express();


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

app.get('/api/notes', (req, res) => {
  let results = notes;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});





// app.get('/api/notes', (req, res) => {
//   res.json(notes);
// });



app.listen(3001, () => {
  console.log(`API server now at port 3001!`);
});