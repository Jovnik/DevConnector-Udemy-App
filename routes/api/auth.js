// this file is going to pertain to jsonwebtokens
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route      GET api/auth
// @desc       Test Route   
// @access     Public (dont need to be authorized to access this route);

//protect the route with the auth middleware
router.get('/', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');  //the .select('-password') will leave off the password in the data
        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});    


// @route      POST api/auth
// @desc       Authenticate user and get token 
// @access     Public (idea is to get token so that we can then access private routes)
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()   
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });    // es6 syntax because the email key and value are named the same
        
        if(!user){
            return res.status(400).json({ errors: [{msg: 'Invalid credentials'}] });
        }

        const isMatch = await bcrypt.compare(password, user.password);  //password is the plain text password, user.password is the encrypted pass

        if(!isMatch){
            return res.status(400).json( { errors: [{ msg: 'Invalid credentials' }] });
        }

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


    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

