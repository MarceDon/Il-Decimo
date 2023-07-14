const { validationResult } = require("express-validator");

const User = require("../models/user");
const Match = require("../models/match");

const { logger } = require("../util/logger");

const MATCHES_PER_PAGE = 3;

exports.getMatches = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalMatches;
  let currentDate = new Date();
  Match.find({time: {$gte: currentDate}})
    .countDocuments()
    .then((numMatches) => {
      totalMatches = numMatches;
      return Match.find({time: {$gte: currentDate}})
        .skip((page - 1) * MATCHES_PER_PAGE)
        .limit(MATCHES_PER_PAGE);
    })
    .then((matches) => {
      res.render("app/match-list", {
        ms: matches,
        pageTitle: "All Matches",
        path: "/matches",
        currentPage: page,
        hasNextPage: MATCHES_PER_PAGE * page < totalMatches,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalMatches / MATCHES_PER_PAGE),
      });
    })
    .catch((err) => console.log(err));
};

exports.getMatch = (req, res, next) => {
  const matchId = req.params.matchId;
  let nameUser = null;
  let playerIn = false;
  let is_full = false;
  let is_over = false;

  if (req.user) {
    User.findById(req.user._id)
      .then((user) => {
        nameUser = user.usrName;
        if (!(user.matchList.length === 0)) {
          userMatch = user.matchList.find((element) =>
            element.matchId.equals(matchId)
          );
        }
      })
      .catch((err) => console.log(err));
  }
  Match.findById(matchId)
    .populate({
      path: "listPlayers.players.userId",
      model: "User",
    })
    .then((match) => {
      if (req.session.isLoggedIn) {
        const risultato = match.listPlayers.players.find(
          (element) => element.userId._id == req.user._id.toString()
        );
        if (risultato !== undefined) {
          playerIn = true;
        }
        if (match.currentPlayers == match.totalPlayers) {
          is_full = true;
        }
        const today = new Date();
        if (match.time < today) {
          is_over = true;
        }
        const result = match.listPlayers.populate("players.userId");
      }

          res.render("app/match-detail", {
            m: match,
            user: nameUser,
            pageTitle: match.title,
            path: "/matches",
            is_in: playerIn,
            is_full: is_full,
            isOver: is_over,
          });
    })
    .catch((err) => console.log(err));
};

exports.getAddMatch = (req, res, next) => {
  res.render("user/add-match", {
    pageTitle: "Add Match",
    path: "/add-match",
    editing: false,
    hasError: false,
    match: null,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddMatch = (req, res, next) => {
  const title = req.body.title;
  const placeName = req.body.placeName;
  const address = req.body.address;
  const time = req.body.time;
  const price = req.body.price;
  const description = req.body.description;
  const totalPlayers = req.body.totalPlayers;
  const currentPlayers = 0;
  const hostUserId = req.user;

  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage ="'" + req.method + "' request to " + "'" + req.url + "' from "+ req.user.usrName +" (IP: " +  remoteAddress + ")"

  const errors = validationResult(req);
  if (!errors.isEmpty()) {

      logger(data.MONGODB_URI_LOGS).then((logger) => {
        logger.warn(logMessage + " Campi inseriti errati.")
      });

    return res.status(422).render("user/add-match", {
      pageTitle: "Add Match",
      path: "/add-match",
      hasError: true,
      editing: false,
      match: {
        title: title,
        placeName: placeName,
        address: address,
        time: time,
        price: price,
        description: description,
        totalPlayers: totalPlayers,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const match = new Match({
    title: title,
    placeName: placeName,
    address: address,
    time: time,
    price: price,
    description: description,
    totalPlayers: totalPlayers,
    currentPlayers: currentPlayers,
    listPlayers: {
      players: [],
    },
    hostUserId: hostUserId,
  });
  match.save()
    .then(() => {
      User.findById(req.user._id).then((user) => {
        user.matchList.push({ matchId: match._id });
        user.save();
      });
      match.addPlayer(hostUserId);
      

        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.info(logMessage + " Match creato correttamente.")
        });

      res.redirect("/mymatches");
    })
    .catch((err) => console.log(err));
};

exports.getEditMatch = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const matchId = req.params.matchId;
  Match.findById(matchId)
    .then((match) => {
      res.render("user/edit-match", {
        pageTitle: "Edit Match",
        path: "/edit-match/:matchId",
        editing: editMode,
        match: match,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditMatch = (req, res, next) => {
  const matchId = req.body.matchId;
  const updatedTitle = req.body.title;
  const updatedPlaceName = req.body.placeName;
  const updatedAddress = req.body.address;
  const updatedTime = req.body.time;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const updatedTotalPlayers = req.body.totalPlayers;
  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage ="'"+req.method+"' request to "+"'"+req.url+"' from " + req.user.usrName + " (IP: "+remoteAddress+")";

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const logErrorMessage = "Username: "+req.session.user.usrName+" - fallito edit match.";

      logger(data.MONGODB_URI_LOGS).then((logger) => {
        logger.error(logMessage + " " + logErrorMessage);
      });
    return res.status(422).render("user/edit-match", {
      pageTitle: "Edit Match",
      path: "/edit-match",
      hasError: true,
      editing: true,
      match: {
        title: updatedTitle,
        placeName: updatedPlaceName,
        address: updatedAddress,
        time: updatedTime,
        price: updatedPrice,
        description: updatedDescription,
        totalPlayers: updatedTotalPlayers,
        _id: matchId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Match.findById(matchId)
    .then((match) => {
      match.title = updatedTitle;
      match.placeName = updatedPlaceName;
      match.address = updatedAddress;
      if (!!updatedTime) {
        match.time = updatedTime;
      }
      match.price = updatedPrice;
      match.description = updatedDescription;
      match.totalPlayers = updatedTotalPlayers;
      return match.save();
    })
    .then(() => {
      const logInfoMessage = "Username: "+req.session.user.usrName+" - edit match completato con successo."
      ().then((data) => {
        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.info(logMessage + " " + logInfoMessage)
        });
      })
      res.redirect("/mymatches");
    })
    .catch((err) => console.log(err));
};

exports.getUserMatches = (req, res, next) => {
  const userId = req.user;
  Match.find({ hostUserId: userId })
    .then((matches) => {
      Match.find({ "listPlayers.players.userId": userId })
        .find({ hostUserId: { $not: { $eq: userId } } })
        .then((joinedMatches) => {
          res.render("user/mymatches", {
            ms: matches,
            jMatches: joinedMatches,
            pageTitle: "My Matches",
            path: "/mymatches",
          });
        });
    })
    .catch((err) => console.log(err));
};

exports.getJoinMatch = (req, res, next) => {
  const matchId = req.params.matchId;
  let is_in = false;
  let is_full = false;
  Match.findById(matchId)
    .then((match) => {
      const result = match.listPlayers.players.find(
        (element) => element.userId == req.user._id.toString()
      );
      if (result !== undefined) is_in = true;
      if (match.currentPlayers == match.totalPlayers) is_full = true;
      res.render("app/join-match", {
        m: match,
        pageTitle: "Join Match",
        path: "/matches/:matchId/join",
        playerIn: is_in,
        is_full: is_full,
        editing: true,
      });
    })
    .catch((err) => console.log(err));
};

exports.postJoinMatch = (req, res, next) => {
  const matchId = req.body.matchId;
  const joiningUserId = req.user._id;
  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage = "'"+req.method+"' request to "+"'"+req.url+"' from " + req.user.usrName + " (IP: "+remoteAddress+")";

  Match.findById(matchId)
    .then((match) => {
      if (match.currentPlayers != match.totalPlayers) {
        User.findById(req.user._id).then((user) => {
          user.matchList.push({ matchId: match._id });
          user.save();
        });
        const logInfoMessage = "Username: "+req.session.user.usrName+" - aggiunto al match: "+match._id+".";

          logger(data.MONGODB_URI_LOGS).then((logger) => {
            logger.info(logMessage + " " + logInfoMessage);
          });
        return match.addPlayer(joiningUserId);
      } else {
        const logErrorMessage = "Username: "+req.session.user.usrName+" - ERRORE aggiunta al match: "+match._id+".";

          logger(data.MONGODB_URI_LOGS).then((logger) => {
            logger.error(logMessage + " " + logErrorMessage);
          });
      }
    })
    .then(() => {
      res.redirect("/matches/" + matchId.toString());
    })
    .catch((err) => {
      const logErrorMessage = "Username: "+req.session.user.usrName+" - ERRORE in JoinMatch: "+matchId+". "+err;

        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.error(logMessage + " " + logErrorMessage);
        });
      console.log(err)
    });
};

exports.getUnJoinMatch = (req, res, next) => {
  const matchId = req.params.matchId;
  let is_in = false;
  let can_unjoin = false;
  let currentDate = new Date();
  Match.findById(matchId)
    .then((match) => {
      const result = match.listPlayers.players.find(
        (element) => element.userId == req.user._id.toString()
      );
      if (result !== undefined) is_in = true;
      let matchDate = new Date(match.time);
      let diffInSec = matchDate / 60000 - currentDate / 60000;
      if (diffInSec > 1440) can_unjoin = true;
      res.render("app/unjoin-match", {
        m: match,
        pageTitle: "Join Match",
        path: "/matches/:matchId/join",
        playerIn: is_in,
        can_unjoin: can_unjoin,
        editing: true,
      });
    })
    .catch((err) => console.log(err));
};

exports.postUnJoinMatch = (req, res, next) => {
  const matchId = req.body.matchId;
  const unjoiningUserId = req.user._id;
  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage = "'"+req.method+"' request to "+"'"+req.url+"' from " + req.user.usrName + " (IP: "+remoteAddress+")";

  Match.findById(matchId)
    .then((match) => {
      const logInfoMessage = "Username: "+req.session.user.usrName+" - rimosso dal match: "+match._id+".";

        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.info(logMessage + " " + logInfoMessage);
        });
      return match.RemovePlayer(unjoiningUserId);
    })
    .then(() => {
      res.redirect("/mymatches");
    })
    .catch((err) => {
      const logErrorMessage = "Username: "+req.session.user.usrName+" - ERRORE in UnjoinMatch: "+matchId+". "+err;

        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.error(logMessage + " " + logErrorMessage);
        });
      console.log(err)
    });
};

exports.postDeleteMatch = (req, res, next) => {
  const matchId = req.body.matchId;
  const remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logMessage = "'"+req.method+"' request to "+"'"+req.url+"' from " + req.user.usrName + " (IP: " +  remoteAddress + ")";
  Match.findByIdAndRemove(matchId)
    .then(() => {
      const logWarnMessage = "Username: "+req.session.user.usrName+" - Match eliminato con successo.";
        logger(data.MONGODB_URI_LOGS).then((logger) => {
          logger.warn(logMessage + " " + logWarnMessage);
        });

      res.redirect("/mymatches");

    })
    .catch((err) => console.log(err));
};
