const express = require("express");
const app = express();
const { connect } = require("./config/database");
const Restaurant = require("./models/restaurants");

app.use(express.json());

const data = {
  restaurants: [
    { name: "ristorante1", _id: 1 },
    { name: "ristorante2", _id: 2 },
    { name: "ristorante3", _id: 3 },
  ],
};

app.get("/api/v1/restaurants", (req, res) => {
  return res.json(data);
});

app.get("/api/v1/restaurants/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = data.restaurants.find(
    (rest) => rest._id === Number(restaurantId)
  );
  if (restaurant) {
    res.send(restaurant);
  } else {
    res.status(400).send("Id required");
  }
});

app.post("/api/v1/restaurants", (req, res) => {
  const { body } = req;
  if (body.name) {
    data.restaurants.push({ ...body, _id: data.restaurants.length + 1 });
    return res.json(data);
  } else {
    res.status(400).send("Restaurant name required");
  }
});

app.put("/api/v1/restaurants/:restaurantId", (req, res) => {
  const { body } = req;
  const { restaurantId } = req.params;

  if (body.name && body._id) {
    const restaurantIndex = data.restaurants.findIndex(
      (restaurant) => restaurant._id === Number(restaurantId)
    );
    if (restaurantIndex !== -1) {
      Object.assign(data.restaurants[restaurantIndex], body); //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Object/assign
      return res.send(data.restaurants[restaurantIndex]);
    } else {
      res.status(404).send("Restaurant not found");
    }
  } else {
    res.status(400).send("Restaurant name and Id required");
  }
});

app.patch("/api/v1/restaurants/:restaurantId", (req, res) => {
  const { body } = req;
  const { restaurantId } = req.params;
  if (!restaurantId) {
    res.status(400).send("Id required");
  }
  if (body) {
    const restaurantIndex = data.restaurants.findIndex(
      (restaurant) => restaurant._id === Number(restaurantId)
    );
    if (restaurantIndex !== -1) {
      Object.assign(data.restaurants[restaurantIndex], body); //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Object/assign
      return res.send(data.restaurants[restaurantIndex]);
    }
    res.status(404).send();
  } else {
    res.status(400).send();
  }
});

app.delete("/api/v1/restaurants/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;
  if (!restaurantId) {
    res.status(400).send("Id required");
  }
  const restaurantIndex = data.restaurants.findIndex(
    (restaurant) => restaurant._id === Number(restaurantId)
  );
  if (restaurantIndex !== -1) {
    data.restaurants.splice(restaurantIndex, 1);
    res.send(`Restaurant ${restaurantId} was deleted`);
  } else {
    res.status(404).send();
  }
});

app.listen(5000, () => {
  console.log("Running on port 5000");
});

connect();
