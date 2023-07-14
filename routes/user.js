const express = require('express');
const { body } = require('express-validator');
const { Promise, Error } = require('sequelize');

const userController = require('../controllers/user');
const User = require('../models/user');

const isAuth = require('../middleware/is-auth');
const isVerified = require('../middleware/is-verified');
const isEnabled = require('../middleware/is-enabled');

const router = express.Router();

const passErr = 'Perfavore inserisci una password valida! Deve contenere: almeno 8 caratteri,'+
                ' almeno 1 lettera minuscola, almeno 1 lettera maiuscola, almeno 1 numero e almeno 1 simbolo';

router.get('/', function(req, res){userController.getIndex});

router.get('/terms', function(req, res){userController.getTerms});

router.get('/myprofile', isAuth, isEnabled, isVerified, function(req, res){userController.getUserProfile});

router.get('/editUser/:username', isAuth, isEnabled, isVerified, function(req, res){userController.getEditUser});
router.post('/editUser', isAuth, isEnabled, isVerified,
  [
    body('usrName', 'Perfavore inserisci un Username con almeno 6 caratteri, composto solo da lettere o numeri!')
      .isLength({ min: 4, max: 60 })
      .custom((value, { req }) => {
        if(value == req.body.userName) {
            return true
        } else {
            return User.findOne({ usrName: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject('Username già utilizzato!')
            }
            })
        }
      })
      .trim(),
    body('nome', 'Perfavore inserisci il tuo Nome correttamente!')
      .isLength({ min: 1, max: 28 })
      .isString()
      .trim(),
    body('cognome', 'Perfavore inserisci il tuo Cognome correttamente!')
      .isLength({ min: 1, max: 28 })
      .isString()
      .trim(),
    body('numTel', 'Perfavore inserisci un Numero telefonico valido, o non inserirlo')
      .trim()
      .custom((value) => {
        if (!value) {
            return true
        } else if (value.length == 10) {
            return true
        } else {
            throw new Error('Perfavore inserisci un Numero telefonico valido, o non inserirlo')
        }
      })
      .escape(),
    body('age', 'Inserisci un età valida, o non inserirla').trim().escape(),
    body('city', 'Inserisci una città valida, o non inserirla').trim(),
    body('state', 'Inserisci una nazione valida, o non inserirla').trim(),
    body('squad', 'Inserisci una squadra valida, o non inserirla').trim(),
    body('bio', 'Inserisci una bio valita, o non inserirla').trim(),
  ], 
  function(req, res){userController.postEditUser}
);

router.get('/myprofile/editpass', isAuth, isEnabled, isVerified, function(req, res){userController.getEditPassword});
router.post('/myprofile/editpass', isAuth, isEnabled, isVerified,
  [
    body('oldPassword')
      .trim()
      .escape(),
    body('newPassword', passErr)
      .isLength({ min: 8, max: 50 })
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false,
        pointsPerUnique: 1,
        pointsPerRepeat: 0.5,
        pointsForContainingLower: 10,
        pointsForContainingUpper: 10,
        pointsForContainingNumber: 10,
        pointsForContainingSymbol: 10,
      })
      .trim()
      .custom((value, { req }) => {
        if (value == req.body.oldPassword) {
          throw new Error('La Nuova password deve essere diversa dalla Vecchia password!')
        }
        return true
      })
      .escape(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('La conferma password deve essere uguale alla Nuova password inserita!')
        }
        return true
      })
      .escape(),
  ], 
  function(req, res){userController.postEditPassword}
);

module.exports = router; 