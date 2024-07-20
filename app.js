const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let database = null;

const initializationAndDbServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3002/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`), process.exit(1);
  }
};

initializationAndDbServer();

const convertDbServerToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const movieDetails = `
  SELECT 
  movie_name 
  FROM 
  movie`;

  const movieArray = await database.all(movieDetails);
  response.send(
    movieArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

//API 2

app.get("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const getMovieDetailsById = `SELECT * FROM movie WHERE movie_id = ${movieId}`;
  const getMovieDetails = await database.get(getMovieDetailsById);
  res.send(convertDbServerToResponseObject(getMovieDetails));
});

//API 3

app.post("/movies/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const addDetailsToDatabase = `
  INSERT INTO 
  movie(director_id,movie_name,lead_actor)
  VALUES (
      ${directorId},
      '${movieName}',
      '${leadActor}'
  )
  `;
  const movieDetails = await database.run(addDetailsToDatabase);
  res.send("Movie Successfully Added");
});

//API 4

app.put("/movies/:movieId", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const { movieId } = req.params;
  const updateMovieQuery = `
  UPDATE movie 
   SET
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}' 
      
      WHERE movie_id=${movieId}
  `;
  const details = await database.run(updateMovieQuery);
  res.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;

  const deleteAMovieArray = `DELETE FROM movie WHERE movie_id=${movieId}`;
  const deleteRes = await database.run(deleteAMovieArray);
  res.send("Movie Removed");
});

//API 6

app.get("/directors/", async (req, res) => {
  const allDirectorsList = `SELECT * FROM director`;
  const directedMovie = await database.all(allDirectorsList);
  res.send(
    directedMovie.map((eachMovie) => ({
      directorId: eachMovie.director_id,
      directorName: eachMovie.director_name,
    }))
  );
});

//API 7

app.get("/directors/:directorId/movies", async (req, res) => {
  const { directorId } = req.params;
  const getDetailsOfMovie = `SELECT * FROM movie WHERE director_id=${directorId}`;
  const movieArray = await database.all(getDetailsOfMovie);
  res.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
