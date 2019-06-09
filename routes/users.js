const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const router = express.Router();
const stripe = require('stripe')('sk_test_BApkpaCYxJrFyYU7wvmQEXCR00dmEM95gW');

// Load User model
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const User = require('../models/User');
const UsersModel = require('../models/product');
const uploadimage = require('../models/image');

router.use(bodyParser.json());
router.use(methodOverride('_method'));
router.use(express.static('public'));
router.use(bodyParser.urlencoded({
    extended: false
}));

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('user'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('user'));

// Register
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('user', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('user', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});


router.post('/myproduct', function(req, res, next) {
    console.log("Succeslful");

    const mybodydata = {

        pname: req.body.pname,
        description: req.body.description,
        price: req.body.price
    }
    var data = UsersModel(mybodydata);
    //var data = UsersModel(req.body);
    data.save(function(err) {
        if (err) {

            res.render('userprofile', { messsage: 'User registered not successfully!' });
        } else {

            res.redirect('/uploadimage');
        }
    })
});


router.get('/displayproduct', (req, res, next) => {
    UsersModel.find((err, prods) => {
        //console.log(personas);
        if (err) throw err;
        res.render('allproduct',

            { prods: prods });
    });
});
router.get('/displaymyproduct', (req, res, next) => {
    UsersModel.find((err, prods) => {
        //console.log(personas);
        if (err) throw err;
        res.render('myproduct',

            { prods: prods });
    });
});

// Index Route


// Charge Route
router.post('/charge',
    (req, res) => {
        const amount = 700;

        stripe.customers.create({
                email: req.body.stripeEmail,
                source: req.body.stripeToken
            })
            .then(customer => stripe.charges.create({
                amount,
                description: 'My Shop Transaction',
                currency: 'usd',
                customer: customer.id
            }))
            .then(charge => res.render('success', {
                user: req.user
            }));
    });




/* DELETE User BY ID */
router.get('/delete/:id', function(req, res) {
    UsersModel.findByIdAndRemove(req.params.id, function(err, project) {
        if (err) {

            req.flash('error_msg', 'Record Not Deleted');
            res.redirect('../displaymyproduct');
        } else {

            req.flash('success_msg', 'Record Deleted');
            res.redirect('../displaymyproduct');
        }
    });
});

// router.get('/edit/:id', function(req, res) {
//     console.log(req.params.id);
//     UsersModel.findById(req.params.id, function(err, user) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(user);

//             res.render('edit-form');
//         }
//     });
// });










// Body Parser Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));



// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/displayproduct',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});


// @route POST /upload
// @desc  Uploads file to DB
router.post('/uploadimage', uploadimage.single('file'), (req, res) => {
    // res.json({ file: req.file });
    res.redirect('/userprofile');
});


// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});


module.exports = router;