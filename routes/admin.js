const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');
const isVerified = require('../middleware/is-verified');
const isAdmin = require('../middleware/is-admin');
const isEnabled = require('../middleware/is-enabled');

const router = express.Router();

router.get("/listMatch", isAuth, isEnabled, isVerified, isAdmin, function(req, res){adminController.getListMatch});

router.get("/listUser", isAuth, isEnabled, isVerified, isAdmin, function(req, res){adminController.getListUser});

router.get('/utente/:username', isAuth, isEnabled, isVerified, isAdmin,  function(req, res){adminController.getUserProfile});

router.get('/editRole/:username', isAuth, isEnabled, isVerified, isAdmin, function(req, res){adminController.getEditRole});
router.post('/editRole', isAuth, isEnabled, isVerified, isAdmin, function(req, res){adminController.postEditRole});

router.post('/disattiva-utente', isAuth, isEnabled, isVerified, isAdmin, function(req, res){adminController.postDisableUser});
router.post('/attiva-utente', isAuth, isEnabled, isVerified, isAdmin, function(req, res){adminController.postEnableUser});

module.exports = router;