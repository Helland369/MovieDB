const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const app = express();
const port = 3000;

// .env
dotenv.config();

// load directorys
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'img')));

// route
app.get('/', (req, res) =>
{
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// trending
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
      const title = item.title || item.name || 'NO TITLE!';
      const originalTitle = item.original_name || item.original_title || 'NO ORIGINAL TITLE!';
      const description = item.overview || 'NO DESCRIPTION!';
      const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'NO POSTRER!';
      
      return `<h2>${title}</h2> <h3>${originalTitle}</h3> <p>${description}</p> <img src="${poster}">`;
    }).join('');

    res.send(`
      <h1>Trending now!</h1>
        <div>
          <div>${htmlItems}</div>
        </div>
    `);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching trending');
  }
});

app.get('/tmdb/search', async (req, res) => {

  const searchQuery = req.query.query;

  if (!searchQuery)
  {
    return res.send(`<div id="results"></div>`);
  }
  
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=1`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.TMDB}`
    }
  };

  try
  {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
    
    const data = await response.json();

    const html = data.results.map(movie => `
      <div class="movie">
        <strong>${movie.title}</strong> (${movie.release_date?.slice(0, 4) || 'N/A'})<br>
        <em>${movie.overview?.slice(0, 150) || 'NO DESCRIPTION AVAILABLE'}...</em>
        <hr>
      </div>
   `).join('');

    res.send(html);
  }
  catch (err)
  {
    console.log(err);
    res.status(500).send('Error fetching trending');
  }
});

// server
app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});
