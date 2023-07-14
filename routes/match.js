const express = require('express');
const { body } = require('express-validator');

const matchController = require('../controllers/match');

const isAuth = require('../middleware/is-auth');
const isVerified = require('../middleware/is-verified');

const router = express.Router();

router.get('/matches', function(req, res){matchController.getMatches});

router.get('/matches/:matchId', isAuth, isVerified, function(req, res){matchController.getMatch});

router.get('/add-match', isAuth, isVerified, function(req, res){matchController.getAddMatch});
router.post('/add-match', isAuth, isVerified,
  [
    body('title', 'Inserisci un nome valido').isString().isLength({ min: 3 }).trim(),
    body('placeName', 'Inserisci un luogo valido').isString().isLength({ min: 3 }).trim(),
    body('address', 'Inserisci un indirizzo valido').isString().isLength({ min: 3 }).trim(),
    body('totalPlayers', 'Inserisci un numero di giocatori valido').isNumeric().escape(),
    body('price', 'Inserisci un prezzo valido').isFloat().escape(),
    body('description', 'Inserisci una descrizione valida').isLength({ min: 5, max: 250 }).trim(),
  ],
  function(req, res){matchController.postAddMatch}
);

router.get('/edit-match/:matchId', isAuth, isVerified, function(req, res){matchController.getEditMatch});
router.post('/edit-match', isAuth, isVerified,
  [
    body('title', 'Inserisci un nome valido').isString().isLength({ min: 3 }).trim(),
    body('placeName', 'Inserisci un luogo valido').isString().isLength({ min: 3 }).trim(),
    body('address', 'Inserisci un indirizzo valido').isString().isLength({ min: 3 }).trim(),
    body('totalPlayers', 'Inserisci un numero di giocatori valido').isNumeric().escape(),
    body('price', 'Inserisci un prezzo valido').isFloat().escape(),
    body('description', 'Inserisci una descrizione valida').isLength({ min: 5, max: 250 }).trim(),
  ],
  function(req, res){matchController.postEditMatch}
);

router.get('/mymatches', isAuth, isVerified, function(req, res){matchController.getUserMatches});

router.get('/matches/:matchId/join', isAuth, isVerified, function(req, res){matchController.getJoinMatch});
router.post('/matches/:matchId/join', isAuth, isVerified, function(req, res){matchController.postJoinMatch});

router.get('/matches/:matchId/unjoin', isAuth, isVerified, function(req, res){matchController.getUnJoinMatch});
router.post('/matches/:matchId/unjoin', isAuth, isVerified, function(req, res){matchController.postUnJoinMatch});

router.post('/vote-match', isAuth, isVerified, function(req, res){matchController.postVoteMatch});

router.post('/delete-match', isAuth, isVerified, function(req, res){matchController.postDeleteMatch});

module.exports = router; 