const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const app = express();
const port = 3000;

// cookies
const cookieParser = require("cookie-parser");
//const { url } = require("inspector");
app.use(cookieParser());

// forms
app.use(express.urlencoded({ extended: true }));

// JSON
app.use(express.json());

// .env
dotenv.config();

// load directorys
app.use("/css", express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "img")));

// global variables
const redirect = "http://localhost:3000/tmdb/auth/callback";

// funcitions

const getAccountId = async (sessionId) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/account?session_id=${sessionId}`,
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB}`,
      },
    },
  );

  const data = await response.json();
  if (!response.ok)
    throw new Error(`Failed to get account id: ${data.status_message}`);
  return data.id;
};

// route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// add movie rating
app.post("/tmdb/add_rating_movie", async (req, res) => {
  const { movieId, rating } = req.body;

  const url = `https://api.themoviedb.org/3/movie/${movieId}/rating`;

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
    body: JSON.stringify({ value: parseFloat(rating) }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    res.send(
      `<p>Thanks for rating this movie: ${movieId}! TMDB says: ${data.status_message}</p>`,
    );
  } catch (err) {
    console.log("TMDB post error:", err);
    res.status(500).send("Error adding movie rating");
  }
});

// add tv-show rating
app.post("/tmdb/add_rating_tv", async (req, res) => {
  const { movieId, rating } = req.body;

  const url = `https://api.themoviedb.org/3/tv/${movieId}/rating`;

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
    body: JSON.stringify({ value: parseFloat(rating) }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    res.send(
      `<p>Thanks for rating this movie: ${movieId}! TMDB says: ${data.status_message}</p>`,
    );
  } catch (err) {
    console.log("TMDB post error:", err);
    res.status(500).send("Error adding tv-show rating");
  }
});

// trending all
app.get("/tmdb/trending", async (req, res) => {
  let page = parseInt(req.query.page) || 1;

  const url = `https://api.themoviedb.org/3/trending/all/day?language=en-US&page=${page}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();

    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "No Title";
        const originalTitle =
          item.original_name || item.original_title || "No Original Title";
        const description = item.overview || "No Description";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "/no-poster.jpg";
        const voteAvg = item.vote_average || "No Rating";
        const id = item.id;
        const mediaType = item.media_type;

        return `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <h2>${title}</h2>
            <h3>${originalTitle}</h3>
            <p>${description}</p>
            <img src="${poster}" alt="${title} poster" style="max-width: 200px;">
            <p>Rating: ${voteAvg}</p>
            <form hx-post="/tmdb/add_rating_${mediaType}" hx-target="this" hx-swap="outerHTML">
              <input type="hidden" name="movieId" value="${id}">
              <label>Rate this ${mediaType} (0.5 - 10):</label>
              <input type="number" name="rating" min="0.5" max="10" step="0.5" required>
              <button type="submit">Submit Rating</button>
            </form>
            <form hx-post="/tmdb/add_favorite" hx-target="#favorite-message-${id}" hx-swap="innerHTML">
              <input type="hidden" name="movieId" value="${id}">
              <input type="hidden" name="mediaType" value="${mediaType}">
              <button type="submit">Add to Favorites</button>
            </form>
            <div id="favorite-message-${id}"></div>
          </div>
        `;
      })
      .join("");

    const html = `
      <div id="container">
        ${htmlItems}
        <div hx-get="/tmdb/trending?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>
      </div>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div id="container" style="color: red;">Error fetching trending content. Please try again.</div>',
      );
  }
});

// trending tv-shows
app.get("/tmdb/trending_tv_show", async (req, res) => {
  let page = parseInt(req.query.page) || 1;

  const url = `https://api.themoviedb.org/3/trending/tv/day?language=en-US&page=${page}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();

    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "No Title";
        const originalTitle =
          item.original_name || item.original_title || "No Original Title";
        const description = item.overview || "No Description";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "/no-poster.jpg";
        const id = item.id;

        return `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <h2>${title}</h2>
            <h3>${originalTitle}</h3>
            <p>${description}</p>
            <img src="${poster}" alt="${title} poster" style="max-width: 200px;">
            <form hx-post="/tmdb/add_rating_tv" hx-target="this" hx-swap="outerHTML">
              <input type="hidden" name="movieId" value="${id}">
              <label>Rate this TV show (0.5 - 10):</label>
              <input type="number" name="rating" min="0.5" max="10" step="0.5" required>
              <button type="submit">Submit Rating</button>
            </form>
            <form hx-post="/tmdb/add_favorite" hx-target="#favorite-message-${id}" hx-swap="innerHTML">
              <input type="hidden" name="movieId" value="${id}">
              <input type="hidden" name="mediaType" value="tv">
              <button type="submit">Add to Favorites</button>
            </form>
            <div id="favorite-message-${id}"></div>
          </div>
        `;
      })
      .join("");

    const html = `
      <div id="container">
        ${htmlItems}
        <div hx-get="/tmdb/trending_tv_show?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>
      </div>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div id="container" style="color: red;">Error fetching trending TV shows. Please try again.</div>',
      );
  }
});

// trendin movies
app.get("/tmdb/trending_movie", async (req, res) => {
  let page = parseInt(req.query.page) || 1;

  const url = `https://api.themoviedb.org/3/trending/movie/day?language=en-US&page=${page}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();

    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "No Title";
        const originalTitle =
          item.original_name || item.original_title || "No Original Title";
        const description = item.overview || "No Description";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "/no-poster.jpg";
        const id = item.id;

        return `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <h2>${title}</h2>
            <h3>${originalTitle}</h3>
            <p>${description}</p>
            <img src="${poster}" alt="${title} poster" style="max-width: 200px;">
            <form hx-post="/tmdb/add_rating_movie" hx-target="this" hx-swap="outerHTML">
              <input type="hidden" name="movieId" value="${id}">
              <label>Rate this movie (0.5 - 10):</label>
              <input type="number" name="rating" min="0.5" max="10" step="0.5" required>
              <button type="submit">Submit Rating</button>
            </form>
            <form hx-post="/tmdb/add_favorite" hx-target="#favorite-message-${id}" hx-swap="innerHTML">
              <input type="hidden" name="movieId" value="${id}">
              <input type="hidden" name="mediaType" value="movie">
              <button type="submit">Add to Favorites</button>
            </form>
            <div id="favorite-message-${id}"></div>
          </div>
        `;
      })
      .join("");

    const html = `
      <div id="container">
        ${htmlItems}
        <div hx-get="/tmdb/trending_movie?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>
      </div>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div id="container" style="color: red;">Error fetching trending movies. Please try again.</div>',
      );
  }
});

// details
app.get("/tmdb/details/:media_type/:id", async (req, res) => {
  const { media_type, id } = req.params;

  const url = `https://api.themoviedb.org/3/${media_type}/${id}?language=en-US`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB detail error: ${response.status}`);

    const item = await response.json();

    const title = item.title || item.name || "No Title";
    const originalName =
      item.original_name || item.original_title || "No Original Name";
    const description = item.overview || "No Description";
    const airDate = item.first_air_date || item.release_date || "No Air Date";
    const avgRating = item.vote_average || "No Average Rating";
    const posterPath = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : "/no-poster.jpg";

    const html = `
      <div id="container" style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
        <h1>${title}</h1>
        <h3>${originalName}</h3>
        <img src="${posterPath}" alt="${title} poster" style="max-width: 200px;">
        <p>${description}</p>
        <p><strong>First Aired/Released:</strong> ${airDate}</p>
        <p><strong>Rating:</strong> ${avgRating}</p>
        <form hx-post="/tmdb/add_favorite" hx-target="#favorite-message-${id}" hx-swap="innerHTML">
          <input type="hidden" name="movieId" value="${id}">
          <input type="hidden" name="mediaType" value="${media_type}">
          <button type="submit">Add to Favorites</button>
        </form>
        <div id="favorite-message-${id}"></div>
      </div>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div id="container" style="color: red;">Error fetching details. Please try again.</div>',
      );
  }
});

// search
app.get("/tmdb/search", async (req, res) => {
  const searchQuery = req.query.query;
  let page = parseInt(req.query.page) || 1;

  if (!searchQuery) {
    return res.send('<div id="results"></div>');
  }

  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=${page}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();

    const htmlItems =
      data.results.length > 0
        ? data.results
            .map((item) => {
              const title = item.title || item.name || "No Title";
              const releaseDate =
                item.release_date?.slice(0, 4) ||
                item.first_air_date?.slice(0, 4) ||
                "N/A";
              const description =
                item.overview?.slice(0, 150) || "No Description Available";
              const mediaType = item.media_type;
              const id = item.id;

              return `
                <a
                  href="#"
                  hx-get="/tmdb/details/${mediaType}/${id}"
                  hx-target="#container"
                  hx-swap="innerHTML"
                  style="text-decoration: none; color: inherit;"
                >
                  <strong>${title}</strong> (${releaseDate})<br>
                  <em>${description}</em>
                  <hr>
                </a>
              `;
            })
            .join("")
        : "<div>No results found.</div>";

    const html = `
      <div id="results">
        ${htmlItems}
        <div hx-get="/tmdb/search?query=${encodeURIComponent(searchQuery)}&page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>
      </div>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div id="results" style="color: red;">Error fetching search results. Please try again.</div>',
      );
  }
});

// filter search
app.get("/tmdb/filter_search", async (req, res) => {
  const {
    media_type = "movie",
    genre,
    year,
    sort_by = "popularity.desc",
    page = 1,
  } = req.query;

  let url = `https://api.themoviedb.org/3/discover/${media_type}?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=${sort_by}`;
  if (genre) url += `&with_genres=${genre}`;
  if (year) {
    url +=
      media_type === "movie"
        ? `&primary_release_year=${year}`
        : `&first_air_date_year=${year}`;
  }

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB detail error: ${response.status}`);

    const data = await response.json();

    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "No Title";
        const originalTitle =
          item.original_title || item.original_name || "No Original Title";
        const description = item.overview || "No Description";
        const releaseDate =
          item.release_date || item.first_air_date || "No Release Date";
        const averageRating = item.vote_average || "No Average Rating";
        const totRatings = item.vote_count || "No Total Ratings";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "/no-poster.jpg";
        const id = item.id;
        const mediaType = item.media_type || media_type;

        return `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <h2>${title}</h2>
            <h3>${originalTitle}</h3>
            <img src="${poster}" alt="${title} poster" style="max-width: 200px;">
            <p>${description}</p>
            <p>Release Date: ${releaseDate}</p>
            <p>Average Rating: ${averageRating} | Total Ratings: ${totRatings}</p>
            <form hx-post="/tmdb/add_rating_${mediaType}" hx-target="this" hx-swap="outerHTML">
              <input type="hidden" name="movieId" value="${id}">
              <label>Rate this ${mediaType} (0.5 - 10):</label>
              <input type="number" name="rating" min="0.5" max="10" step="0.5" required>
              <button type="submit">Submit Rating</button>
            </form>
            <form hx-post="/tmdb/add_favorite" hx-target="#favorite-message-${id}" hx-swap="innerHTML">
              <input type="hidden" name="movieId" value="${id}">
              <input type="hidden" name="mediaType" value="${mediaType}">
              <button type="submit">Add to Favorites</button>
            </form>
            <div id="favorite-message-${id}"></div>
          </div>
        `;
      })
      .join("");

    const nextPage = parseInt(page) + 1;

    const html = `
      <div id="results">
        ${htmlItems}
        <div hx-get="/tmdb/filter_search?media_type=${encodeURIComponent(media_type)}&genre=${encodeURIComponent(genre || "")}&year=${encodeURIComponent(year || "")}&sort_by=${encodeURIComponent(sort_by)}&page=${nextPage}" hx-trigger="revealed" hx-swap="afterend"></div>
      </div>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div id="results" style="color: red;">Error fetching filter search results. Please try again.</div>',
      );
  }
});

// filter search form
app.get("/filter_form", async (req, res) => {
  const { media_type = "movie", genre, year, sort_by } = req.query;

  try {
    const movieGenresUrl =
      "https://api.themoviedb.org/3/genre/movie/list?language=en-US";
    const tvGenresUrl =
      "https://api.themoviedb.org/3/genre/tv/list?language=en-US";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB}`,
      },
    };

    const [movieGenresResponse, tvGenresResponse] = await Promise.all([
      fetch(movieGenresUrl, options),
      fetch(tvGenresUrl, options),
    ]);

    if (!movieGenresResponse.ok || !tvGenresResponse.ok) {
      throw new Error("Failed to fetch genres");
    }

    const movieGenresData = await movieGenresResponse.json();
    const tvGenresData = await tvGenresResponse.json();

    const movieGenres = movieGenresData.genres || [];
    const tvGenres = tvGenresData.genres || [];

    const years = Array.from(
      { length: 50 },
      (_, i) => new Date().getFullYear() - i,
    );

    const html = `
      <form class="filter-form" hx-get="/tmdb/filter_search" hx-target="#results" hx-swap="innerHTML" hx-indicator="#loading">
        <label for="media_type">Media Type:</label>
        <select name="media_type" id="media_type" hx-get="/genres" hx-target="#genre" hx-swap="innerHTML" hx-trigger="change">
          <option value="movie" ${media_type === "movie" ? "selected" : ""}>Movie</option>
          <option value="tv" ${media_type === "tv" ? "selected" : ""}>TV Show</option>
        </select>

        <label for="genre">Genre:</label>
        <select name="genre" id="genre">
          <option value="">Any Genre</option>
          ${(media_type === "movie" ? movieGenres : tvGenres)
            .map(
              (g) =>
                `<option value="${g.id}" ${genre == g.id ? "selected" : ""}>${g.name}</option>`,
            )
            .join("")}
        </select>

        <label for="year">Year:</label>
        <select name="year" id="year">
          <option value="">Any Year</option>
          ${years.map((y) => `<option value="${y}" ${year == y ? "selected" : ""}>${y}</option>`).join("")}
        </select>

        <label for="sort_by">Sort By:</label>
        <select name="sort_by" id="sort_by">
          <option value="popularity.desc" ${sort_by === "popularity.desc" ? "selected" : ""}>Popularity Descending</option>
          <option value="popularity.asc" ${sort_by === "popularity.asc" ? "selected" : ""}>Popularity Ascending</option>
          <option value="vote_average.desc" ${sort_by === "vote_average.desc" ? "selected" : ""}>Rating Descending</option>
          <option value="vote_average.asc" ${sort_by === "vote_average.asc" ? "selected" : ""}>Rating Ascending</option>
        </select>

        <button type="submit">Apply Filters</button>
        <button type="button" hx-get="/tmdb/filter_search?media_type=movie&sort_by=popularity.desc&page=1" hx-target="#results">Clear Filters</button>
      </form>

      <script>
        window.movieGenres = ${JSON.stringify(movieGenres.map((g) => ({ id: g.id, name: g.name })))};
        window.tvGenres = ${JSON.stringify(tvGenres.map((g) => ({ id: g.id, name: g.name })))};
      </script>
    `;
    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div style="color: red;">Error loading filter form. Please try again.</div>',
      );
  }
});

// genres
app.get("/genres", (req, res) => {
  const { media_type = "movie" } = req.query;
  const html = `
    <select name="genre" id="genre">
      <option value="">Any Genre</option>
      <script>
        const genres = document.getElementById('media_type').value === 'movie' ? window.movieGenres : window.tvGenres;
        document.getElementById('genre').innerHTML = '<option value="">Any Genre</option>' + 
          genres.map(g => \`<option value="\${g.id}">\${g.name}</option>\`).join('');
      </script>
    </select>
  `;
  res.send(html);
});

// authentication
app.get("/tmdb/auth", async (req, res) => {
  const url = "https://api.themoviedb.org/3/authentication/token/new";
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();

    const token = data.request_token;

    const tmdbRedirectUri = `https://www.themoviedb.org/authenticate/${token}?redirect_to=${encodeURIComponent(redirect)}`;
    res.redirect(tmdbRedirectUri);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching auth token");
  }
});

app.get("/tmdb/auth/callback", async (req, res) => {
  const { request_token } = req.query;

  if (!request_token) {
    return res.status(400).send("Missing request_token");
  }

  const url = "https://api.themoviedb.org/3/authentication/session/new";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
    body: JSON.stringify({ request_token }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();

    res.cookie("tmdb_session_id", data.session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 1000, // 1 week
    });

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error compleating TMDB auth");
  }
});

app.post("/tmdb/add_favorite", async (req, res) => {
  const { movieId, mediaType } = req.body;

  const tmdb_session_id = req.cookies.tmdb_session_id;

  if (!tmdb_session_id) {
    return res.status(400).send("You must be logged in to favorite a movie");
  }

  if (!["movie", "tv"].includes(mediaType)) {
    return res.status(400).send("Invalid mediaType, must be movie or tv");
  }

  try {
    const accountId = await getAccountId(tmdb_session_id);

    const url = `https://api.themoviedb.org/3/account/${accountId}/favorite?session_id=${tmdb_session_id}`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.TMDB}`,
      },
      body: JSON.stringify({
        media_type: mediaType,
        media_id: parseInt(movieId),
        favorite: true,
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    res.send(
      `<p>Thanks for favoriting this movie: ${movieId}! TMDB says: ${data.status_message}</p>`,
    );
  } catch (err) {
    console.log("TMDB post error:", err);
    res.status(500).send("Error adding favorites");
  }
});

// favorite movies
app.get("/tmdb/view_favorite_movies", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  const tmdb_session_id = req.cookies.tmdb_session_id;

  if (!tmdb_session_id) {
    return res
      .status(400)
      .send(
        '<div id="container" style="color: red;">You must be logged in to view favorite movies.</div>',
      );
  }

  try {
    const accountId = await getAccountId(tmdb_session_id);
    const url = `https://api.themoviedb.org/3/account/${accountId}/favorite/movies?language=en-US&page=${page}&sort_by=created_at.asc&session_id=${tmdb_session_id}`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB}`,
      },
    };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();

    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "No Title";
        const originalTitle = item.original_title || "No Original Title";
        const description = item.overview || "No Description";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "/no-poster.jpg";

        return `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <h2>${title}</h2>
            <h3>${originalTitle}</h3>
            <img src="${poster}" alt="${title} poster" style="max-width: 200px;">
            <p>${description}</p>
          </div>
        `;
      })
      .join("");

    const html = `
      <div id="container">
        ${htmlItems}
        <div hx-get="/tmdb/view_favorite_movies?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>
      </div>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div id="container" style="color: red;">Error fetching favorite movies. Please try again.</div>',
      );
  }
});

// favoritte tv shows
app.get("/tmdb/view_favorite_tv_shows", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  const tmdb_session_id = req.cookies.tmdb_session_id;

  if (!tmdb_session_id) {
    return res
      .status(400)
      .send(
        '<div id="container" style="color: red;">You must be logged in to view favorite TV shows.</div>',
      );
  }

  try {
    const accountId = await getAccountId(tmdb_session_id);
    const url = `https://api.themoviedb.org/3/account/${accountId}/favorite/tv?language=en-US&page=${page}&sort_by=created_at.asc&session_id=${tmdb_session_id}`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB}`,
      },
    };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();

    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "No Title";
        const originalTitle =
          item.original_title || item.original_name || "No Original Title";
        const description = item.overview || "No Description";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "/no-poster.jpg";

        return `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <h2>${title}</h2>
            <h3>${originalTitle}</h3>
            <img src="${poster}" alt="${title} poster" style="max-width: 200px;">
            <p>${description}</p>
          </div>
        `;
      })
      .join("");

    const html = `
      <div id="container">
        ${htmlItems}
        <div hx-get="/tmdb/view_favorite_tv_shows?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>
      </div>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div id="container" style="color: red;">Error fetching favorite TV shows. Please try again.</div>',
      );
  }
});

// top rated movies
app.get("/tmdb/top_rated_movies", async (req, res) => {
  let page = parseInt(req.query.page) || 1;

  const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();

    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "No Title";
        const originalTitle =
          item.original_title || item.original_name || "No Original Title";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "/no-poster.jpg";
        const description = item.overview || "No Description";
        const avgRating = item.vote_average || "No Average Rating";
        const totalRatings = item.vote_count || "No Total Ratings";

        return `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <h2>${title}</h2>
            <h3>${originalTitle}</h3>
            <p>${description}</p>
            <img src="${poster}" alt="${title} poster" style="max-width: 200px;">
            <p>Average Rating: ${avgRating} | Total Ratings: ${totalRatings}</p>
          </div>
        `;
      })
      .join("");

    const html = `
      <div id="container">
        ${htmlItems}
        <div hx-get="/tmdb/top_rated_movies?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>
      </div>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        '<div id="container" style="color: red;">Error fetching top rated movies. Please try again.</div>',
      );
  }
});

// server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
