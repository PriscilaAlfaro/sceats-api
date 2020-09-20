// https://github.com/bezkoder/node-express-mongodb/blob/master/app/controllers/tutorial.controller.js
//https://mongoosejs.com/docs/index.html

const mongoose = require("mongoose");
const restaurants = require("./models/restaurants");
const Restaurant = require("./models/restaurants");

function saveElementInDb(restaurant) {
  const newRestaurant = new Restaurant(restaurant);

  return newRestaurant.save(newRestaurant).then((restaurant) => {
    return restaurant;
  });
}

function getAllElements() {
  return restaurants.find({}).then((restaurants) => {
    return restaurants;
  });
}

function getById(_id) {
  return restaurants.findById({ _id }).then((restaurant) => {
    return restaurant;
  });
}

function updateElement(id, datatoUpdate) {
  return restaurants
    .findOneAndReplace({ _id: id }, datatoUpdate, {
      new: true,
      upsert: true,
    })
    .then((restaurant) => {
      return restaurant;
    });
}

function deleteElement(id) {
  return restaurants.findOneAndDelete({ _id: id }).then(() => {
    return "Restaurant deleted";
  });
}
module.exports = {
  saveElementInDb,
  getAllElements,
  getById,
  updateElement,
  deleteElement,
};
