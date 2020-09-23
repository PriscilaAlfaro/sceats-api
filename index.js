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

app.get("/api/v1/restaurants", (req, res) => {
  getAllElements()
    .then((restaurants) => {
      res.send(restaurants);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.get("/api/v1/restaurants/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;
  if (restaurantId) {
    console.log(restaurantId);
    getById(restaurantId)
      .then((restaurant) => {
        res.send(restaurant);
      })
      .catch((err) => {
        console.log(err);
        let errorCode = err.code || 500;
        let errorMessage = err.message || err;
        res.status(errorCode).send(errorMessage);
      });
  } else {
    res.status(400).send("Require id as parameter");
  }
});

//---------------Authentication needed------------------//
app.post("/api/v1/restaurants", authenticateJWT, (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.sendStatus(403); //Since the authentication middleware binds the user to the request, we can fetch the role from the req.user object and simply check if the user is an admin
  }
  const { body } = req;
  if (body.name && body.rating) {
    saveElementInDb(body)
      .then((restaurant) => {
        res.send(restaurant);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send();
      });
  } else {
    res.status(400).send("Required name and rating");
  }
});

app.put("/api/v1/restaurants/:restaurantId", authenticateJWT, (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.sendStatus(403);
  }
  const { body } = req;
  const { restaurantId } = req.params;

  if (body.name && body.rating) {
    replaceElement(restaurantId, { name: body.name, rating: body.rating })
      .then((restaurant) => {
        res.send(restaurant);
      })
      .catch((err) => {
        console.log(err);
        let errorCode = err.code || 500;
        let errorMessage = err.message || err;
        res.status(errorCode).send(errorMessage);
      });
  } else {
    res.status(400).send("Required name and rating");
  }
});

app.patch("/api/v1/restaurants/:restaurantId", authenticateJWT, (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.sendStatus(403);
  }
  const { body } = req;
  const { restaurantId } = req.params;

  if (body.name || body.rating) {
    updateASingleValue(restaurantId, { name: body.name, rating: body.rating })
      .then((restaurant) => {
        res.send(restaurant);
      })
      .catch((err) => {
        console.log(err);
        let errorCode = err.code || 500;
        let errorMessage = err.message || err;
        res.status(errorCode).send(errorMessage);
      });
  } else {
    res.status(400).send("Value to update required");
  }
});

app.delete("/api/v1/restaurants/:restaurantId", authenticateJWT, (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.sendStatus(403);
  }

  const { restaurantId } = req.params;
  deleteElement(restaurantId)
    .then((message) => {
      res.send(message);
    })
    .catch((err) => {
      console.log(err);
      let errorCode = err.code || 500;
      let errorMessage = err.message || err;
      res.status(errorCode).send(errorMessage);
    });
});

app.listen(5000, () => {
  console.log("Running on port 5000");
});

connect();
