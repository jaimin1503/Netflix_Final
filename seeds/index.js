const mongoose = require("mongoose");
const Movie = require("../models/movie");

mongoose.connect("mongodb://localhost:27017/netflix", {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Movie.deleteMany({});

  const mov = new Movie({
    title: "Stranger_ Things",
    image:
      "https://upload.wikimedia.org/wikipedia/en/7/78/Stranger_Things_season_4.jpg",
    genre: "Horror",
    ratings: 8.8,
    year: 2019,
  
  });
  await mov.save();
};

seedDB().then(() => {
  mongoose.connection.close();
});
