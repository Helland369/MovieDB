const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const app = express();
const port = 3000;

// cookies
const cookieParser = require("cookie-parser");
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
    res.status(500).send("Something went wrong");
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
    res.status(500).send("Something went wrong");
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

    // loop out the items
    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "NO TITLE!";
        const originalTitle =
          item.original_name || item.original_title || "NO ORIGINAL TITLE!";
        const description = item.overview || "NO DESCRIPTION!";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "NO POSTRER!";
        const voteAvg = item.vote_average || "NO RATING";
        const id = item.id;

        return `
        <div>
          <h2>${title}</h2>
          <h3>${originalTitle}</h3>
          <p>${description}</p>
          <img src="${poster}">
          <p>Rating: ${voteAvg}</p>

          <form hx-post="/tmdb/add_rating_movie" hx-target="this" hx-swap="outerHTML">
            <input type="hidden" name="movieId" value="${id}">
            <label>Rate this movie (0.5 - 10):</label>
            <input type="number" name="rating" min="0.5" max="10" step="0.5" required>
            <button type="submit">Submit rating</button>
          </form>

          <form
            hx-post="/tmdb/add_favorite"
            hx-target="#favorite-message-${id}"
            hx-swap="innerHTML">

            <input type="hidden" name="movieId" value="${id}">
            <button type="submit">Add to favorites</button>
          </form>

          <div id="favorite-message-${id}"></div>
        </div>
      `;
      })
      .join("");

    let html = `
        <div>
          <div>${htmlItems}</div>
        </div>
    `;

    html += `<div hx-get="/tmdb/trending?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>`;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching trending");
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

    // loop out the items
    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "NO TITLE!";
        const originalTitle =
          item.original_name || item.original_title || "NO ORIGINAL TITLE!";
        const description = item.overview || "NO DESCRIPTION!";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "NO POSTRER!";
        const id = item.id;

        return `
        <h2>${title}</h2>
        <h3>${originalTitle}</h3>
        <p>${description}</p>
        <img src="${poster}">

        <form hx-post="/tmdb/add_rating_tv" hx-target="this" hx-swap="outerHtML">
          <input type="hidden" name="movieId" value="${id}">
          <label>Rate this movie (0.5 - 10):</label>
          <input type="number" name="rating" min="0.5" max="10" step="0.5" required>
          <button type="submit">Submit rating</button>
        </form>
     `;
      })
      .join("");

    let html = `
        <div>
          <div>${htmlItems}</div>
        </div>
    `;

    html += `<div hx-get="/tmdb/trending_tv_show?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>`;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching trending tv shows");
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

    // loop out the items
    const htmlItems = data.results
      .map((item) => {
        const title = item.title || item.name || "NO TITLE!";
        const originalTitle =
          item.original_name || item.original_title || "NO ORIGINAL TITLE!";
        const description = item.overview || "NO DESCRIPTION!";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "NO POSTRER!";
        const id = item.id;

        return `
        <div>
          <h2>${title}</h2>
          <h3>${originalTitle}</h3>
          <p>${description}</p>
          <img src="${poster}">

          <form hx-post="/tmdb/add_rating_movie" hx-target="this" hx-swap="outerHtML">
            <input type="hidden" name="movieId" value="${id}">
            <label>Rate this movie (0.5 - 10):</label>
            <input type="number" name="rating" min="0.5" max="10" step="0.5" required>
            <button type="submit">Submit rating</button>
          </form>
        <div>
      `;
      })
      .join("");

    let html = `
        <div>
          <div>${htmlItems}</div>
        </div>
    `;

    html += `<div hx-get="/tmdb/trending_movie?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>`;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching trending movies");
  }
});

// search
app.get("/tmdb/search", async (req, res) => {
  const searchQuery = req.query.query;
  let page = parseInt(req.query.page) || 1;

  if (!searchQuery) {
    return res.send(`<div id="results"></div>`);
  }

  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=${page}`;

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
              const title = item.title || "NO TITLE";
              const releseDate = item.release_date?.slice(0, 4) || "N/A";
              const description =
                item.overview?.slice(0, 150) || "NO DESCRIPTION AVAILABLE";

              return `<strong>${title}</strong> ${releseDate}<rb><em>${description}</em><hr>`;
            })
            .join("")
        : `<div></div>`;

    let html = `<div>${htmlItems}</div>`;

    html += `<div hx-get="/tmdb/search?query=${searchQuery}&page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>`;

    res.send(html);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching search");
  }
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
    console.log("Session id: ", data.session_id);

    res.cookie("tmdb_session_id", data.session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 1000, // 1 week
    });

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error conpleating TMDB auth");
  }
});

app.post("/tmdb/add_favorite", async (req, res) => {
  const { movieId } = req.body;

  const tmdb_session_id = req.cookies.tmdb_session_id;

  if (!tmdb_session_id) {
    return res.status(400).send("You must be logged in to favorite a movie");
  }

  if (!movieId) {
    return res.status(400).send("Missing movieId");
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
        media_type: "movie",
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
    res.status(500).send("Something went wrong");
  }
});

// TODO add favorite movies and tv-shows.
app.get("/tmdb/view_favorites", async (req, res) => {
  let page = parseInt(req.query.page) || 1;

  const tmdb_session_id = req.cookies.tmdb_session_id;

  if (!tmdb_session_id) {
    return res.status(400).send("You must be logged in to favorite a movie");
  }

  try {
    const accountId = await getAccountId(tmdb_session_id);

    const url = `https://api.themoviedb.org/3/account/${accountId}/favorite/movies?language=en-US${page}&sort_by=created_at.asc&session_id=${tmdb_session_id}`;
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
        const title = item.title || item.name || "NO TITLE!";
        const originalTitle = item.original_title || "NO ORIGINAL TITLE!";
        const description = item.overview || "NO DESCRIPTION";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "NO POSTRER!";

        return `
        <div>
          <h2>${title}</h2>
          <h3>${originalTitle}</h3>
          <img src="${poster}">
          <p>${description}</p>
        </div>
      `;
      })
      .join("");

    let html = `
      <div>
        <div>${htmlItems}</div>
      </div>
    `;

    html += `<div hx-get="/tmdb/view_favorites?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>`;

    res.send(html);
  } catch (err) {
    console.log("TMDB post error:", err);
    res.status(500).send("Something went wrong");
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
        const title = item.title || item.name || "NO TITLE!";
        const originalTitle =
          item.original_title || item.original_name || "NO ORIGINAL TITLE!";
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "NO POSTER!";
        const description = item.overview || "NO DESCRIPTION!";
        const avgRating = item.vote_average || "NO AVERAGE RATING!";
        const totalRatings = item.vote_count || "NO TOTAL RATINGS!";

        return `
        <div>
          <h2>${title}</h2>
          <h3>${originalTitle}</h3>
          <p>${description}</p>
          <img src="${poster}">
          <p>Average rating: ${avgRating} Total ratings: ${totalRatings}</p>
        </div>
      `;
      })
      .join("");

    let html = `
      <div>
        <div>${htmlItems}</div>
      </div>
    `;

    html += `
      <div hx-get="/tmdb/top_rated_movies?page=${page + 1}" hx-trigger="revealed" hx-swap="afterend"></div>
    `;
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching trending movies");
  }
});

// server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
