//https://mongoosejs.com/docs/index.html
//See promises https://github.com/bezkoder/node-express-mongodb/blob/master/app/controllers/tutorial.controller.js
//See validate ObjectId https://github.com/Automattic/mongoose/issues/1959
//See throw https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Sentencias/throw
//See throw vrs reject https://stackoverflow.com/questions/33445415/javascript-promises-reject-vs-throw
const mongoose = require("mongoose");
const restaurants = require("./models/restaurants");
const Restaurant = require("./models/restaurants");

async function getAllElements() {
  return await restaurants.find({});
}

async function getById(id) {
  //verify if id is + or - than String of 12 bytes or a string of 24 hex characters with Bad request (400) instead a 500
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { message: `No valid id: ${id}`, code: 400 };
  }

  const restaurant = await restaurants.findById({ _id: id });
  if (restaurant) {
    return restaurant;
  } else {
    throw {
      message: `The restaurant ${id} does not exist`, //send a Bad Request (400) if Id does not exist, instead a 500
      code: 400,
    };
  }
}

async function saveElementInDb(restaurant) {
  const newRestaurant = new Restaurant(restaurant);
  return await newRestaurant.save(newRestaurant);
}

async function replaceElement(id, datatoUpdate) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { message: `No valid id: ${id}`, code: 400 };
  }
  const restaurant = await restaurants.findById({ _id: id });
  if (!restaurant) {
    throw {
      message: `The restaurant ${id} does not exist`,
      code: 400,
    };
  } else {
    return await restaurants.findOneAndReplace({ _id: id }, datatoUpdate, {
      new: true,
      upsert: true,
    });
  }
}

async function updateASingleValue(id, dataToUpdate) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { message: `No valid id: ${id}`, code: 400 };
  }
  const restaurant = await restaurants.findById({ _id: id });
  if (!restaurant) {
    throw {
      message: `The restaurant ${id} does not exist`,
      code: 400,
    };
  } else {
    return await restaurants.findByIdAndUpdate({ _id: id }, dataToUpdate, {
      new: true,
      upsert: true,
    });
  }
}

async function deleteElement(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { message: `No valid id: ${id}`, code: 400 };
  }

  const restaurant = await restaurants.findById({ _id: id });
  if (!restaurant) {
    throw {
      message: `The restaurant ${id} does not exist`,
      code: 400,
    };
  } else {
    await restaurants.findOneAndDelete({ _id: id });
    return `Restaurant ${id} was deleted`;
  }
}
module.exports = {
  saveElementInDb,
  getAllElements,
  getById,
  replaceElement,
  updateASingleValue,
  deleteElement,
};
