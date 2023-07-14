const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const passport = require("passport");
const toobusy = require('toobusy-js');
const hpp = require('hpp');
const helmet = require('helmet')

require("dotenv").config();

const { logger } = require("./util/logger");

const errorController = require("./controllers/error");

const User = require("./models/user");

const app = express();
const csrfProtection = csrf();

const userRoutes = require("./routes/user");
const matchRoutes = require("./routes/match");
const authRoutes = require("./routes/auth");
const federateRoutes = require("./routes/federate");
const adminRoutes = require("./routes/admin");

app.set("view engine", "ejs");
app.set("views", "views");

  const store = new MongoDBStore({
    uri: data.MONGODB_URI,
    collection: "sessions",
  });

  app.use(helmet.hsts());
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());

  app.use(hpp())
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));
  app.use(
    session({
      secret: data.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        maxAge: 7200000, //la sessione si cancella dopo 2h
        httpOnly: true,
        //secure: true,  //solo in fase di deploy
        //sameSite: true
      },
    })
  );

  app.use(function(req, res, next) {
    const { method, socket, url } = req;
    const remoteAddress =
      req.headers["x-forwarded-for"] || socket.remoteAddress;
      let username = "guest";
    if (!!req.session.user) {
      username = req.session.user.usrName;
    }
    const logMessage =
      "'" +
      method +
      "' request to " +
      "'" +
      url +
      "' from " +
      username +
      " (IP: " +
      remoteAddress +
      ")";
    if (toobusy()) {
        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.info(logMessage, " - Richiesta rifiutata perchè il server è impegnato.");
        });
        res.status(503).send("Server Too Busy");
    } else {
    next();
    }
});

  app.use((req, res, next) => {
    const { method, socket, url } = req;
    const remoteAddress =
      req.headers["x-forwarded-for"] || socket.remoteAddress;
    let username = "guest";
    if (!!req.session.user) {
      username = req.session.user.usrName;
    }
    const logMessage =
      "'" +
      method +
      "' request to " +
      "'" +
      url +
      "' from " +
      username +
      " (IP: " +
      remoteAddress +
      ")";

    logger(data.MONGODB_URI_LOGS).then((logger) => {
      logger.info(logMessage);
    });

    next();
  });

  app.use(csrfProtection);
  app.use(passport.authenticate("session"));

  passport.serializeUser(function (req, user, cb) {
    req.session.user = user;
    req.session.isLoggedIn = true;
    process.nextTick(function () {
      cb(null, { id: user.id, username: user.usrName, email: user.email });
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });

  app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then((user) => {
        req.user = user;
        res.locals.user = user;
        next();
      })
      .catch((err) => console.log(err));
  });

  app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    if (!!req.session.passport) {
      res.locals.isAuthenticated = true;
    }
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  app.use((req, res, next) => {
    if (res.locals.isAuthenticated) {
      res.locals.isAdministrator = false;
      if (res.locals.user.role == "admin") {
        res.locals.isAdministrator = true;
      } else {
        res.locals.isAdministrator = false;
      }
    } else {
      res.locals.isAdministrator = false;
    }
    next();
  });

  app.use(userRoutes);
  app.use(matchRoutes);
  app.use(authRoutes);
  app.use(federateRoutes);
  app.use(adminRoutes);

  app.use(errorController.get404);

  mongoose.set("useCreateIndex", true);
  mongoose.set("useUnifiedTopology", true);

  mongoose
    .connect(data.MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      const port = process.env.PORT || 5000;
      app.listen(port);
      console.log("Listening on port ", port);
    })
    .catch((err) => {
      console.log(err);
    });
