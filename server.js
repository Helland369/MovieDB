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

// trending all
app.get('/tmdb/trending', async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  
  const url = `https://api.themoviedb.org/3/trending/all/day?language=en-US&page=${page}`;

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

    let html =`
        <div>
          <div>${htmlItems}</div>
        </div>
    `;

    html += `<div hx-get="/tmdb/trending?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>`;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching trending');
  }
});

// trending tv-shows
app.get('/tmdb/trending_tv_show', async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  
  const url = `https://api.themoviedb.org/3/trending/tv/day?language=en-US&page=${page}`;

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

    let html =`
        <div>
          <div>${htmlItems}</div>
        </div>
    `;

    html += `<div hx-get="/tmdb/trending_tv_show?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>`;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching trending');
  }
});

// trendin movies
app.get('/tmdb/trending_movie', async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  
  const url = `https://api.themoviedb.org/3/trending/movie/day?language=en-US&page=${page}`;

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

    let html =`
        <div>
          <div>${htmlItems}</div>
        </div>
    `;

    html += `<div hx-get="/tmdb/trending_movie?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>`;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching trending');
  }
});

// search
app.get('/tmdb/search', async (req, res) => {

  const searchQuery = req.query.query;
  let page = parseInt(req.query.page) || 1;
  
  if (!searchQuery)
  {
    return res.send(`<div id="results"></div>`);
  }

  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=${page}`;

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

    const htmlItems = data.results.length > 0 ? data.results.map(item =>
    {
      const title = item.title || 'NO TITLE';
      const releseDate = item.release_date?.slice(0, 4) || 'N/A';
      const description = item.overview?.slice(0, 150) || 'NO DESCRIPTION AVAILABLE';

      return `<strong>${title}</strong> ${releseDate}<rb><em>${description}</em><hr>`;
    }).join('') : `<div></div>`;

    let html = `<div>${htmlItems}</div>`;

    html += `<div hx-get="/tmdb/search?query=${searchQuery}&page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>`;
    
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
