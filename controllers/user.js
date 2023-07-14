const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const LogSession = require("../models/logSession");
const FederateUser = require('../models/federateUser');

const { logger } = require("../util/logger");

exports.getIndex = (req, res, next) => {
  let message = "";
  if (req.query.info === 'true') {
    LogSession.find({ userId: req.user._id }).then((log) => {
      if(log.length > 1) {
        const currentdate = log[log.length - 2].time
        var getMinutes= currentdate.getMinutes();
        if(currentdate.getMinutes() < 10) {
          var getMinutes= '0' + currentdate.getMinutes()
        }
        var datetime = +currentdate.getDate()+"/"+(currentdate.getMonth()+1)+"/"+currentdate.getFullYear()+" - "+currentdate.getHours()+":"+getMinutes;
        message = "Ultimo accesso: " + (datetime);
      }
      else message = "Log-in effettuato con successo!"
      res.render("app/index", {
        pageTitle: "Il Decimo - Homepage",
        path: "/",
        message: message,
      });
    });
  } else {
    res.render("app/index", {
      pageTitle: "Il Decimo - Homepage",
      path: "/",
      message: "",
    });
  }
};

exports.getTerms = (req, res, next) => {
  res.render("app/termsandconditions", {
    path: "/terms",
    pageTitle: "Termini di Servizio - Il Decimo",
  });
};

exports.getUserProfile = (req, res, next) => {
  const userName = req.user.usrName; 
  User.findOne({ usrName: userName })
    .then((user) => {
      res.render("user/profile", {
        pageTitle: "My Profile",
        path: "/myprofile",
        user: user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditUser = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const userName = req.params.username;
  User.findOne({ usrName: userName })
    .then((user) => {
      res.render("user/editUser", {
        pageTitle: "Edit User",
        path: "/editUser/:username",
        editing: editMode,
        user: user,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditUser = (req, res, next) => {
  const userId = req.body.userId;
  const updUsername = req.body.usrName;
  const updNome = req.body.nome;
  const updCognome = req.body.cognome;
  const updTel = req.body.numTel;
  const updAge = req.body.age;
  const updCity = req.body.city;
  const updState = req.body.state;
  const updPlayRole = req.body.playRole;
  const updFoot = req.body.foot;
  const updSquad = req.body.squad;
  const updBio = req.body.bio;
  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage ="'"+req.method+"' request to "+"'"+req.url+"' from "+req.session.user.usrName+" (IP: "+remoteAddress+")";

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const logErrorMessage = "Username: "+req.session.user.usrName+" - fallita modifica utente: "+userId;

      logger(data.MONGODB_URI_LOGS).then((logger) => {
        logger.error(logMessage + " " + logErrorMessage);
      });
    return res.status(422).render("user/editUser", {
      pageTitle: "Edit User",
      path: "/editUser/:username",
      hasError: true,
      editing: true,
      user: {
        usrName: updUsername,
        nome: updNome,
        cognome: updCognome,
        numTel: updTel,
        age: updAge,
        city: updCity,
        state: updState,
        playRole: updPlayRole,
        foot: updFoot,
        squad: updSquad,
        bio: updBio,
        _id: userId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  User.findById(userId)
    .then((user) => {
      user.usrName = updUsername;
      user.nome = updNome;
      user.cognome = updCognome;
      user.attribute.numTel = updTel;
      user.attribute.age = updAge;
      user.attribute.address.city = updCity;
      user.attribute.address.state = updState;
      user.attribute.playRole = updPlayRole;
      user.attribute.foot = updFoot;
      user.attribute.squad = updSquad;
      user.attribute.bio = updBio;
      return user.save();
    })
    .then(() => {
      const logInfoMessage = "Username: "+req.session.user.usrName+" - edit dell'utente: "+userId+", completato con successo."
      ().then((data) => {
        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.info(logMessage + " " + logInfoMessage)
        });
      })
      if(req.session.user.role == "admin") {
        res.redirect("/utente/"+updUsername);
      } else {
        res.redirect("/myprofile");
      }
    })
    .catch((err) => console.log(err));
};

exports.getEditPassword = (req, res, next) => {
  const userName = req.user.usrName;
  User.findOne({ usrName: userName })
    .then((user) => {
      const userID = user._id;
      FederateUser.findOne({ userId: userID })
      .then((federate) => { 
        const primaModifica = federate.passModified;
        res.render("user/editPass", {
          pageTitle: "Edit Password",
          path: "/myprofile/editpass",
          user: user,
          primaModifica: primaModifica,
          errorMessage: null,
          validationErrors: [],
          oldInput: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          },
        });
      })
      .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postEditPassword = (req, res, next) => {
  const username = req.user.usrName;
  const updOldPassword = req.body.oldPassword;
  const updNewPassword = req.body.newPassword;
  const updConfirmPassword = req.body.confirmPassword;
  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage ="'"+req.method+"' request to "+"'"+req.url+"' from (IP: "+remoteAddress+")";

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const logWarnMessage = "Username: "+username+" - errore modifica password.";

      logger(data.MONGODB_URI_LOGS).then((logger) => {
        logger.warn(logMessage + " " + logWarnMessage)
      });
    return res.status(422).render("user/editPass", {
      pageTitle: "Edit Password",
      path: "/myprofile/editpass",
      primaModifica: req.body.primaModifica,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: {
        oldPassword: updOldPassword,
        newPassword: updNewPassword,
        confirmPassword: updConfirmPassword,
      },
    });
  }

  User.findOne({ usrName: username })
  .then((user) => {
    const userID = user._id;
    FederateUser.findOne({ userId: userID })
    .then((federate) => {
      if (federate) {
        if (!federate.passModified) {
          bcrypt
            .hash(updNewPassword, 12)
            .then((hashedPassword) => {
              user.password = hashedPassword
              federate.passModified = true;
              federate.save();
              return user.save();
            });
            return res.render("user/profile", {
              path: "/myprofile",
              pageTitle: "My Profile",
              message: "Password modificata con successo",
              user: user,
            });
        }
      }
      bcrypt
      .compare(updOldPassword, user.password)
      .then((passOK) => {
          if (passOK) {
            bcrypt
              .hash(updNewPassword, 12)
              .then((hashedPassword) => {
                user.password = hashedPassword
                return user.save();
              });
            return res.render("user/profile", {
              path: "/myprofile",
              pageTitle: "My Profile",
              message: "Password modificata con successo",
              user: user,
            });
          }
          return res.status(422).render("user/editPass", {
            pageTitle: "Edit Password",
            path: "/myprofile/editpass",
            primaModifica: req.body.primaModifica,
            errorMessage: "Old Password errata",
            validationErrors: errors.array(),
            oldInput: {
              oldPassword: updOldPassword,
              newPassword: updNewPassword,
              confirmPassword: updConfirmPassword,
            },
          });
      })
      .catch((err) => {
        console.log(err);
          logger(data.MONGODB_URI_LOGS).then((logger) => {
            logger.error(logMessage + " " + err)
          });
      })
    });
  })
  .catch((err) => {
    console.log(err);
      logger(data.MONGODB_URI_LOGS).then((logger) => {
        logger.error(logMessage + " " + err)
      });
  });
}
