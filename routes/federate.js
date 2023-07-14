const express = require('express');
const bcrypt = require('bcryptjs');
const data = require('../util/data');
var generatePass = require('password-generator');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');

const router = express.Router();

const FederateUser = require('../models/federateUser');
const User = require('../models/user');
const Session = require('../models/session');
const { logger } = require('../util/logger');

router.get('/login/federated/google', passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
  })
);

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

  passport.use(
    new GoogleStrategy(
      {
        clientID: data.GOOGLE_CLIENT_ID,
        clientSecret: data.GOOGLE_CLIENT_SECRET,
        callbackURL: '/oauth2/redirect/google',
        scope: ['profile']
      },
      function verify(issuer, profile, cb) {
        FederateUser.findOne({ subject: profile.id, provider: issuer })
          .then((fUser) => {
            if (!fUser) {
              const pass = generatePass()
              bcrypt.hash(pass, 12)
              .then((hashedPassword) => {
                const user = new User({
                  nome: profile.name.givenName,
                  cognome: profile.name.familyName,
                  usrName: 'g_' + profile.name.givenName + '_' + profile.name.familyName,
                  email: profile.emails[0].value,
                  password: hashedPassword,
                  matcheslist: {
                    matches: []
                  },
                  verified: true,
                })
                user.save()
                .then(() => {
                  const federateUser = new FederateUser({
                    userId: user._id,
                    provider: issuer,
                    subject: profile.id,
                    passModified: false
                  })
                  federateUser.save().then(() => {
                    return cb(null, user)
                  })
                  const logInfoMessage = "Utente: "+user._id+" creato con successo dal profilo Google!";
                  
                    logger(data.MONGODB_URI_LOGS).then((logger) => {
                      logger.info(logInfoMessage)
                    });
                })
                .catch((err) => {
                  return cb(err)
                })
              })
            } else {
              User.findOne({ _id: fUser.userId }).then((user) => {
                Session.find({'session.user.usrName': user.usrName}).then((activeSessions) => {
                  if (activeSessions.length > 2) {
                    const logWarnMessage = "LOGIN FALLITO - Utente: "+user.usrName+" ha troppe sessioni attive!";
                    
                      logger(data.MONGODB_URI_LOGS).then((logger) => {
                        logger.warn(logWarnMessage)
                      });
                    return cb(null, null)
                  } else {
                    const logInfoMessage = "Utente: "+user.usrName+" - LOGIN EFFETTUATO con Google";
                    
                      logger(data.MONGODB_URI_LOGS).then((logger) => {
                        logger.info(logInfoMessage);
                      });
                    return cb(null, user)
                  }
                })
              })
            }
          })
          .catch((err) => {
            return cb(err)
          })
      },
    )
  );

module.exports = router;