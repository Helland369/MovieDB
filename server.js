const express = require('express');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
const port = 3000;

// .env
dotenv.config();

// load directorys
app.use(express.static('img'));
app.use(express.static('views'));

// TMDB api
const url = 'https://api.themoviedb.org/3/configuration';
const options =
{
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
app.get('/', (req, res) =>
{
  res.send('index.html');
});

app.get('/tmdb/trending', async (req, res) => {
  const url = 'https://api.themoviedb.org/3/trending/all/day?language=en-US';

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.TMDB}`
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
    
    const data = await response.json();

    // loop out the items
    const htmlItems = data.results.map(item =>
    {
      const title = item.title || item.name || 'NO TITLE';
      return `<li>${title}</li>`;
    }).join('');

    res.send(`
      <html>
        <body>
          <h1>Trending now!</h1>
          <ul>
            <li>${htmlItems}</li>
          <ul>
        </body
      </html>
    `);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching trending');
  }
});

// server
app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});
