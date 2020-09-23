const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: String,
  rating: Number,
});

//https://mongoosejs.com/docs/models.html
//Mongoose automatically looks for the plural, lowercased version of your model name
module.exports = mongoose.model("Restaurant", RestaurantSchema);
