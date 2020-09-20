const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { connect } = require("./config/database");
const {
  saveElementInDb,
  getAllElements,
  getById,
  updateElement,
  deleteElement,
} = require("./dbProvider");
const Restaurant = require("./models/restaurants");
app.use(express.json());

const accessTokenSecret = "youraccesstokensecret";
app.get("/", (req, res) =>
  res.json({ message: "hello World", name: "local host" })
);

const data = {
  restaurants: [
    { name: "ristorante1", _id: 1 },
    { name: "ristorante2", _id: 2 },
    { name: "ristorante3", _id: 3 },
  ],
};

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

///---------------no authentication
app.get("/api/v1/restaurants", (req, res) => {
  getAllElements()
    .then((restaurants) => {
      res.send(restaurants);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
  //return res.json(data);  => cuando retorna data desde el array creado
});

app.get("/api/v1/restaurants/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;
  /*const restaurant = data.restaurants.find(
    (rest) => rest._id === Number(restaurantId)
  );
  return res.json(restaurant);=> cuando retorna data desde el array creado*/
  console.log(restaurantId);
  getById(restaurantId)
    .then((restaurant) => {
      res.send(restaurant);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

//---------------Authentication needed
app.post("/api/v1/restaurants", authenticateJWT, (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.sendStatus(403); //Since the authentication middleware binds the user to the request, we can fetch the role from the req.user object and simply check if the user is an admin
  }
  const { body } = req;
  data.restaurants.push({ ...body, _id: data.restaurants.length + 1 });

  //guardar en la base de datos
  saveElementInDb(body)
    .then((restaurant) => {
      res.send(restaurant);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });

  //return res.json(data);  => cuando retorna data desde el array creado
});

app.put("/api/v1/restaurants/:restaurantId", authenticateJWT, (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.sendStatus(403);
  }
  const { body } = req;
  const { restaurantId } = req.params;

  updateElement(restaurantId, body)
    .then((restaurant) => {
      res.send(restaurant);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
  /*
  const restaurantIndex = data.restaurants.findIndex(
    (restaurant) => restaurant._id === Number(restaurantId)
  );
  if (restaurantIndex !== -1) {
    Object.assign(data.restaurants[restaurantIndex], body); //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Object/assign
    return res.send(data.restaurants[restaurantIndex]);
  } else {
    res.status(404).send();
  }*/
});

app.delete("/api/v1/restaurants/:restaurantId", authenticateJWT, (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.sendStatus(403); //Since the authentication middleware binds the user to the request, we can fetch the role from the req.user object and simply check if the user is an admin
  }
  //-----
  const { restaurantId } = req.params;
  deleteElement(restaurantId)
    .then((message) => {
      res.send(message);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
  /*const restaurantIndex = data.restaurants.findIndex(
    (restaurant) => restaurant._id === Number(restaurantId)
  );

  if (restaurantIndex !== -1) {
    data.restaurants.splice(restaurantIndex, 1);
    res.send(`Restaurant ${restaurantId} was deleted`);
  } else {
    res.status(404).send();
  }*/
});

app.listen(7000, () => {
  console.log("Running on port 7000");
});

connect();
