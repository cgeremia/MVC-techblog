const path = require("path");
require("dotenv").config();
const express = require("express");
const routes = require("./controllers/");
const sequelize = require("./config/connection");
const exphbs = require("express-handlebars");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const helpers = require("./utils/helpers");

// Initialize handlebars for the html templates
const hbs = exphbs.create({ helpers });

// Initialize sessions
const sess = {
  secret: process.env.DB_SESSION_SECRET,
  cookie: { maxAge: 7200000 },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

// Initialize the server
const app = express();
const PORT = process.env.PORT || 3001;

// Server path to the public directory for static files
app.use(express.static(path.join(__dirname, "public")));

// Set handlebars as the template engine for the server
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Have Express parse JSON and string data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tell the app to use Express Session for the session handling
app.use(session(sess));

// Give the server the path to the routes
app.use(routes);

// Turn on connection to db and then to the server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log("Now listening"));
});
