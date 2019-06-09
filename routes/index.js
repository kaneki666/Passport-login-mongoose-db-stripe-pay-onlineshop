const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/', forwardAuthenticated, (req, res) => res.render('user'));

router.get('/userprofile', ensureAuthenticated, (req, res) =>
    res.render('userprofile', {
        user: req.user
    })
);

router.get('/uploadimage', ensureAuthenticated, (req, res) =>
    res.render('uploadimage', {
        user: req.user
    })
);

router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
        user: req.user
    })
)






module.exports = router;