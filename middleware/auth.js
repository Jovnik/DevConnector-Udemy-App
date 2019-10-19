const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    // Get token from the header
    // console.log(req.header);
    const token = req.header('x-auth-token');

    // Check if no token
    if(!token){
        return res.status(401).json( { msg: 'No token, authorization denied' });
    }

    //Verify Token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret')); //this will decode the token - will you only ever be able to access your own unique token?? What if you got someone elses token?
        // console.log(decoded);
        req.user = decoded.user;    //the payload was a user object that contained the user id
        next();
    } catch(err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}