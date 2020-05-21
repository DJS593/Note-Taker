// to communicate with Heroku we need to tell the app to communicate with the following environment variable
const PORT = process.env.PORT || 3001;

// the two codes below are needed to run express
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






// the .listen() method allows the server to "listen" for the requests

app.listen(PORT, () => {
  console.log(`API server now at port ${PORT}!`);
});