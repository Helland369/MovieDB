const express = require('express');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
const port = 3000;

// .env
dotenv.config();

// load directorys
app.use(express.static('img'));

// TMDB api
const url = 'https://api.themoviedb.org/3/configuration';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB}`
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));


// route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// server
app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});
