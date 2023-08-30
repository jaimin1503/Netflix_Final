if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");
const session = require("express-session");
const flash = require("connect-flash");
const catchAsync = require("./utils/catchAsync");
const Movie = require("./models/movie");
const passport = require("passport");
const localStrategy = require("passport-local");
const user = require("./models/user");
const multer = require("multer");
const { storage } = require("./cloudinary");
const upload = multer({ storage });
const mongoSanitize = require("express-mongo-sanitize");
const hemlmet = require("helmet");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(hemlmet({
  contentSecurityPolicy: false
}))

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

// design file
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const sessionConfig = {
  name: "session",
  secret: "thisisasecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(
  session({
    secret: "Keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// routers
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("users/register");
});

app.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const newUser = await User.register(user, password);
      req.login(newUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Netflix");
        res.redirect("/movies");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

app.post(
  "/login",
  passport.authenticate("local", { failureFlash: true, failureRedirect: "/" }),
  (req, res) => {
    req.flash("success", "welcome back");
    res.redirect("/movies");
  }
);

app.get(
  "/movies",
  catchAsync(async (req, res) => {
    if (!req. isAuthenticated ()) {
      
      res. redirect('/');
      req.flash("success","Login First")
    }else{
    const movies = await Movie.find({});
    res.render("movies/index", { movies });
    }
  })
);

app.get("/play",(req,res) => {
  res.render("movies/video");
})

app.get("/movies/new", (req, res) => {
  res.render("movies/new");
});

// const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'posterimage', maxCount: 1 }])

// app.post("/movies", cpUpload, async (req, res) => {
//   const movie = new Movie(req.body.movie);
//   movie.image = req.files.map((f) => ({ url: f.path, filename: f.filename }));
//   movie.posterimage = req.files.map((f) => ({ url: f.path, filename: f.filename }));
//   await movie.save();
//   req.flash("success", "successfully added new movie");
//   res.redirect(`/movies/${movie._id}`);
// });
const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'posterimage', maxCount: 1 }])

app.post("/movies", cpUpload, async (req, res) => {
  try {
    const movie = new Movie(req.body.movie);

    // Get the Cloudinary URLs and filenames for the uploaded images
    const thumbnailResult = req.files['image'][0];
    const posterImageResult = req.files['posterimage'][0];

    // Assign the URLs and filenames to the movie's image and posterimage fields
    movie.image = {
      url: thumbnailResult.path, // Use thumbnailResult.secure_url if it's a Cloudinary URL
      filename: thumbnailResult.filename
    };
    movie.posterimage = {
      url: posterImageResult.path, // Use posterImageResult.secure_url if it's a Cloudinary URL
      filename: posterImageResult.filename
    };

    // Save the movie to the database
    await movie.save();

    req.flash("success", "Successfully added a new movie");
    res.redirect(`/movies/${movie._id}`);
  } catch (error) {
    console.error('Error adding new movie:', error);
    req.flash("error", "Failed to add a new movie");
    res.redirect("/movies/new");
  }
});


app.get(
  "/movies/:id",
  catchAsync(async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    res.render("movies/show", { movie });
  })
);

app.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success", "Loged Out!");
  res.redirect("/");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("page not found", 404));
});

app.use((err, req, res, next) => {
  const { message = "something went wrong", statusCode = 500 } = err;
  if (!err.message) err.message = "Oh! no something went wrong!";
  res.status(statusCode).render("error", { err });
});

// server listening
app.listen(PORT, () => {
  console.log(`The app start on http://localhost:${PORT}`);
});
