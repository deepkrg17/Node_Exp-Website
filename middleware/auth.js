const User = require('../db/uschema');
var jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token){return res.redirect('/acc/in')}
        var verification = jwt.verify(token, process.env.SKEY);
        var user = await User.findOne({
            _id: verification._id
        });
        
        req.token = token;
        req.user = user;
        
        next();
    } catch (e) {res.status(401).send(e)}
};

module.exports = auth;