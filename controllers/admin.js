const Match = require("../models/match");
const User = require("../models/user");

const { logger } = require("../util/logger");

const ELEM_PER_PAGE = 10;

exports.getListMatch = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalMatches;
  Match.find()
    .countDocuments()
    .then((numMatches) => {
      totalMatches = numMatches;
      return Match.find()
        .skip((page - 1) * ELEM_PER_PAGE)
        .limit(ELEM_PER_PAGE)
    })   
    .then((matches) => {
      res.render("admin/listMatch", {
        ms: matches,
        pageTitle: "Admin - All Matches",
        path: "/listMatch",
        currentPage: page,
        hasNextPage: ELEM_PER_PAGE * page < totalMatches,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalMatches / ELEM_PER_PAGE)
      });
    })
    .catch((err) => console.log(err));
};

exports.getListUser = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalUsers;
  User.find()
    .countDocuments()
    .then((numUsers) => {
      totalUsers = numUsers;
      return User.find()
        .skip((page - 1) * ELEM_PER_PAGE)
        .limit(ELEM_PER_PAGE)
    })   
    .then((users) => {
      res.render("admin/listUser", {
        us: users,
        pageTitle: "Admin - All Users",
        path: "/listUser",
        currentPage: page,
        hasNextPage: ELEM_PER_PAGE * page < totalUsers,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalUsers / ELEM_PER_PAGE)
      });
    })
    .catch((err) => console.log(err));
};

exports.getUserProfile = (req, res, next) => {
  const userName = req.params.username;
  User.findOne({ usrName: userName })
    .then((user) => {
      res.render("admin/profileUser", {
        pageTitle: "Profilo utente",
        path: "/utente/:username",
        user: user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditRole = (req, res, next) => {
  const userName = req.params.username;
  User.findOne({ usrName: userName })
    .then((user) => {
      res.render("admin/editRole", {
        pageTitle: "Editing ruolo utente",
        path: "/editRole/:username",
        user: user,
      });
    })
    .catch((err) => console.log(err));
}

exports.postEditRole = (req, res, next) => {
  const userName = req.body.usrName;
  const updatedRole = req.body.role;
  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage ="'"+req.method+"' request to "+"'"+req.url+"' from " + req.session.user.usrName + " (IP: "+remoteAddress+")";
  User.findOne({ usrName: userName })
    .then((user) => {
      user.role = updatedRole;
      return user.save();
    })
    .then(() => {
      const logInfoMessage = "Username: "+req.session.user.usrName+" - modifica al ruolo di: "+userName;

        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.info(logMessage + " " + logInfoMessage)
        });
      res.redirect("/utente/"+userName);
    })
    .catch((err) => console.log(err));
}

exports.postDisableUser = (req, res, next) => {
  const userName = req.body.usrName;
  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage ="'"+req.method+"' request to "+"'"+req.url+"' from " + req.session.user.usrName + " (IP: "+remoteAddress+")";
  User.findOne({ usrName: userName })
    .then((user) => {
      user.enabled = false;
      return user.save();
    })
    .then(() => {
      const logInfoMessage = "Username: " + req.user.usrName + " ha disattivato l'utente: "+ userName;

        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.info(logMessage + " " + logInfoMessage)
        });
      res.redirect("/listUser");
    })
    .catch((err) => console.log(err));
}

exports.postEnableUser = (req, res, next) => {
  const userName = req.body.usrName;
  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage ="'"+req.method+"' request to "+"'"+req.url+"' from " + req.session.user.usrName + " (IP: "+remoteAddress+")";
  User.findOne({ usrName: userName })
    .then((user) => {
      user.enabled = true;
      return user.save();
    })
    .then(() => {
      const logInfoMessage = "Username: " + req.user.usrName + " ha disattivato l'utente: "+ userName;

        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.info(logMessage + " " + logInfoMessage)
        });

      res.redirect("/listUser");
    })
    .catch((err) => console.log(err));
}