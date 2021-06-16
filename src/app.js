require('dotenv').config();
const path = require("path");
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

require('../db/connectdb');
const User = require('../db/uschema');
const auth = require('../middleware/auth');

app.set('views', path.join(__dirname, '../public'));
app.set('view engine', 'pug');
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/s', (req, res) => {
    res.render('sign');
});
app.post('/s', async (req, res) => {
    try {
        var pass = req.body.password;
        var cpass = req.body.confirmpass;
        if (pass == cpass) {
            var user = new User({
                name: req.body.name,
                gender: req.body.gender,
                age: req.body.age,
                email: req.body.email,
                phone: req.body.phone,
                pass: pass
            });
            var token = await user.generateAuthToken();
            res.cookie('jwt', token, {
                maxAge:30*24*3600*1000,
                httpOnly: true
            });
            await user.save();
            res.redirect('/');
        } else {
            res.render('error', {error:'The password and confirmation password do not match.'});
        }
    } catch (e) {
        res.status(404).end(e)}
});

app.get('/acc', auth, (req, res) => {
    res.render('account', {user:req.user});
});

app.get('/acc/in', (req, res) => {
    res.render('login');
});
app.post('/acc/in', async (req, res) => {
    try {
        var email = req.body.email;
        var pass = req.body.pass;
        var user = await User.findOne({
            email: email
        });
        var isMatch = await bcrypt.compare(pass, user.pass);
        var token = await user.generateAuthToken();
        res.cookie('jwt', token, {
            maxAge:30*24*3600*1000,
            httpOnly: true
        });
        if (isMatch) {
            res.redirect('/');
        } else {
            res.render('error', {error:'Incorrect login details.'});
        }
    } catch (e) {
        res.end(e);
    }
});

app.get('/acc/out', auth, async (req, res) => {
    try {
        res.clearCookie('jwt');
        req.user.tokens = req.user.tokens.filter((elem) =>{
            elem.token != req.token;
        });
        await req.user.save();
        res.redirect('/acc/in');
    } catch (e) {
        res.end(e);
    }
});

app.get('*', (req, res) => {
    res.status(404).render('404');
});

app.listen(8000);