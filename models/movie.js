const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: String,
  image: [
    {
      url: String,
      filename: String
    }
  ],
  posterimage: [
    {
      url: String,
      filename: String
    }
  ],
  genre: String,
  ratings: Number,
  year: Number,
});

module.exports = mongoose.model("Movie", MovieSchema);
