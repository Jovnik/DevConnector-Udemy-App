const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

// @route      POST api/users
// @desc       Register user   
// @access     Public (dont need to be authorized to access this route);
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })   
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });    // es6 syntax because the email key and value are named the same
        
        if(user){
            return res.status(400).json({ errors: [{msg: 'User already exists'}] });    //why do we need the return? (is it if we have multiple res.sends?? Looks like we need to add return if its not the last res.status or res.json etc)
        }

        // Get users gravatar - not really going to implement this in my applications
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email, 
            avatar,
            password: hash
        })

        await user.save();

        // you can also add other information to the payload but all we need is the users id
        const payload = {
            user: {
                id: user.id     //with mongoose you dont have to use _id, its abstracted for you as just id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'), 
            { expiresIn: 360000 },  //can choose how long until the token expires (in seconds)
            (err, token) => {
                if(err) throw err;
                res.json({ token });    //res.json is the same as res.send except res.json converts any non-objects being passed in 
            }
        )

        // we want to return a jwt on registration so that the user  can use that token to authentiate and access protected routes

        // Return jsonwebtoken - when a use registers in the front end the user should login right away so a jwt is required

        // res.send('User route');

    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

