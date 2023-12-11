const exp = require("express");
const app = exp();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(exp.json());
const path = require("path");
const db_path = path.join(__dirname, "moviesData.db");
let db = null;

const update_database = (each) => {
  return {
    movieName: each.movie_name,
  };
};
const update_database_2 = (result) => {
  return {
    movieId: result.movie_id,
    directorId: result.director_id,
    movieName: result.movie_name,
    leadActor: result.lead_actor,
  };
};
const updatedirector = (each) => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  };
};

const installconnection = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server has been started");
    });
  } catch (e) {
    console.log(e.message);
  }
};
installconnection();

// API 1 GET

app.get("/movies/", async (request, response) => {
  let query = `
    SELECT 
    *
    FROM 
    movie;`;
  let array = await db.all(query);
  response.send(array.map((each) => update_database(each)));
});

// API 2 POST

app.post("/movies/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;
  let query = `
  INSERT INTO
  movie (director_id,movie_name,lead_actor)
  VALUES
  (${directorId},'${movieName}','${leadActor}');`;
  let result = await db.run(query);
  response.send("Movie Successfully Added");
});

// API 3

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  console.log(movieId);
  let query = `
  select 
  *
  from
  movie
  WHERE
  movie_id=${movieId};`;
  let result = await db.get(query);
  response.send(update_database_2(result));
});

// API 4
app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  const { movieName, directorId, leadActor } = request.body;
  let query = `
    UPDATE
    movie
    SET
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    Where
    movie_id=${movieId};`;
  let update = await db.run(query);
  response.send("Movie Details Updated");
});

//api 5

app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let query = `
    DELETE 
    FROM
    movie 
    where 
    movie_id=${movieId};`;
  await db.run(query);
  response.send("Movie Removed");
});

// API 6

app.get("/directors/", async (request, response) => {
  const query = `
    SELECT
    *
    FROM
    director;`;
  let result = await db.all(query);
  response.send(result.map((each) => updatedirector(each)));
});

// API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  let query = `
    SELECT 
    movie.movie_name
    FROM 
    director left join movie on 
    director.director_id=movie.director_id
    where
    movie.director_id=${directorId};`;
  let result = await db.all(query);
  console.log(result);
  response.send(result.map((each) => update_database(each)));
});
module.exports = app;
