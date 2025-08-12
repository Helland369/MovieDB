# MovieDB

## Table of Contents

- [About](#About)
- [Installation](#Installation)
  - [Dependencies](#Dependencies)
  - [Setup .env file](#Setup-.env-file)
  - [Run the project](#Run-the-project)

# About
This is a simple IMDB clone made as a school project, using the moviedb api, Express.js and HTMX.

In this application you can see; All trending movies/tv-shows, top rated movies/tv-shows, add to favorite and rate a movie or tv-show.

# Installation

## Dependencies

- [Node.js](https://nodejs.org/en/download)
- [Npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Install both node.js and npm before proceeding!

## Using git

```
git clone https://github.com/Helland369/MovieDB.git

```

cd to project:

```
cd Moviedb
```

install node dependencies:

```
npm install
```

## Setup .env file

In the <mark>Moviedb</mark> directory make a .env file

```
touch .env
```

Create a .env variables

```
TMDB=YOUR_THE_MOVIE_DATABASE_BEARER_TOKEN
```

## Run the project

```
npm run dev
```

# Documentation

## /tmdb/add_rating_movie

Posts the movie rating to tmdb.

## /tmdb/add_rating_tv

Posts the tv-show rating to tmdb.

## /tmdb/trending

Gets all the trending
 tv-shows and movies from tmdb.

## /tmdb/trending
g_tv_show

Gets the trending
g tv-shows from tmdb.

## /tmdb/trending
g_movie

Gets the trending
g movies from tmdb.

## /tmdb/details/:media_type/:id

Gets the detailed information for tv-shows and movies. Information like description, release date, etc.

## /tmdb/search

Gets movies and tv-shows that matches what you search for.

## /tmdb/filter_search

Gets the filtered search results.

## /filter_form

Contains the filter form for; /tmdb/filter_search.

## /genres

Gets the genres for the filter search

## /tmdb/auth

Gets the authentication token for login.

## /tmdb/auth/callback

Gets the callback from tmdb for authentication.

## /tmdb/add_favorite

Posts the movie or tv-show that you want to add to favorites.

## /tmdb/view_favorite_movies

Gets the favorited movies from the logged in
 account.

## /tmdb/view_favorite_tv_shows

Gets the favorited tv-shows from the logged in
 account

## /tmdb/top_rated_movies

Gets the top rated movies from tmdb.


