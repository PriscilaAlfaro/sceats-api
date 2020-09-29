const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { connect } = require("./config/database");

const {
  saveElementInDb,
  getAllElements,
  getById,
  replaceElement,
  updateASingleValue,
  deleteElement,
} = require("./dbProvider");

app.use(express.json());

const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET || "youraccesstokensecret";

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user; //we attach the user object into the request
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.get("/api/v1/restaurants", async (req, res) => {
  try {
    const restaurants = await getAllElements();
    res.send(restaurants);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.get("/api/v1/restaurants/:restaurantId", async (req, res) => {
  const { restaurantId } = req.params;
  if (restaurantId) {
    try {
      const restaurant = await getById(restaurantId);
      res.send(restaurant);
    } catch (err) {
      console.log(err);
      let errorCode = err.code || 500;
      let errorMessage = err.message || err;
      res.status(errorCode).send(errorMessage);
    }
  } else {
    res.status(400).send("Require id as parameter");
  }
});

//---------------Authentication needed------------------//
app.post("/api/v1/restaurants", authenticateJWT, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.sendStatus(403); //Since the authentication middleware binds the user to the request, we can fetch the role from the req.user object and simply check if the user is an admin
  }
  const { body } = req;
  if (body.name && body.rating) {
    try {
      const restaurant = await saveElementInDb(body);
      res.send(restaurant);
    } catch (err) {
      console.log(err);
      res.status(500).send();
    }
  } else {
    res.status(400).send("Required name and rating");
  }
});

app.put(
  "/api/v1/restaurants/:restaurantId",
  authenticateJWT,
  async (req, res) => {
    const { role } = req.user;
    if (role !== "admin") {
      return res.sendStatus(403);
    }
    const { body } = req;
    const { restaurantId } = req.params;

    if (body.name && body.rating) {
      try {
        const restaurant = await replaceElement(restaurantId, {
          name: body.name,
          rating: body.rating,
        });
        res.send(restaurant);
      } catch (err) {
        console.log(err);
        let errorCode = err.code || 500;
        let errorMessage = err.message || err;
        res.status(errorCode).send(errorMessage);
      }
    } else {
      res.status(400).send("Required name and rating");
    }
  }
);

app.patch(
  "/api/v1/restaurants/:restaurantId",
  authenticateJWT,
  async (req, res) => {
    const { role } = req.user;
    if (role !== "admin") {
      return res.sendStatus(403);
    }
    const { body } = req;
    const { restaurantId } = req.params;

    if (body.name) {
      try {
        const restaurant = await updateASingleValue(restaurantId, {
          name: body.name,
        });
        res.send(restaurant);
      } catch (err) {
        console.log(err);
        let errorCode = err.code || 500;
        let errorMessage = err.message || err;
        res.status(errorCode).send(errorMessage);
      }
    } else if (body.rating || body.rating === 0) {
      try {
        const restaurant = await updateASingleValue(restaurantId, {
          rating: body.rating,
        });
        res.send(restaurant);
      } catch (err) {
        console.log(err);
        let errorCode = err.code || 500;
        let errorMessage = err.message || err;
        res.status(errorCode).send(errorMessage);
      }
    } else {
      res.status(400).send("Value to update required");
    }
  }
);

app.delete(
  "/api/v1/restaurants/:restaurantId",
  authenticateJWT,
  async (req, res) => {
    const { role } = req.user;
    if (role !== "admin") {
      return res.sendStatus(403);
    }
    const { restaurantId } = req.params;
    try {
      const restaurant = await deleteElement(restaurantId);
      res.send(restaurant);
    } catch (err) {
      console.log(err);
      let errorCode = err.code || 500;
      let errorMessage = err.message || err;
      res.status(errorCode).send(errorMessage);
    }
  }
);

app.listen(5000, () => {
  console.log("Running on port 5000");
});

connect();
