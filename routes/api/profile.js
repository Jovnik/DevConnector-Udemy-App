const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//How can we use mongoose comands such as findOne and save etc. even when we dont require mongoose into the file

// @route      GET api/profile/me   //just our profile based on the user id in the token
// @desc       Get current users profile
// @access     Private (will need the auth middleware)
router.get('/me', auth, async(req, res) => {
    
    try {
        const profile = await Profile.findOne( { user: req.user.id }).populate('user', ['name', 'avatar']);
        // were going to populate the user field of the profile with just the name and avatar of the user found because we dont need the other fields

        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route      POST api/profile
// @desc       Create or update user profile
// @access     Private
router.post('/', 
    [ auth, 
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills are required').not().isEmpty()
        ] 
    ], 
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;
      
        // Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());    // and what if the use doesnt add a comma accidentally when submitting their skills
        }

        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id }); //should this be a const or a let?
            // console.log(typeof(profile));    profile is an object so we can change it?

            if(profile){    // if a profile is found you will update it
                // Update
                await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
                return res.json(profile);
            }

            //Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);

        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }

    }
)


// @route      GET api/profile 
// @desc       Get all profiles
// @access     Public 
router.get('/', async(req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);     
        // when you populate, you have to use the right model (caps sensitive). Because i made the model name be 'User', i cant use 'user' lowercase here
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route      GET api/profile/user/:user_id 
// @desc       Get profile by user id
// @access     Public 
router.get('/user/:user_id', async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);     
        
        if(!profile){
            return res.status(400).json({ msg: 'Profile not found'})
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);

        // we need to include this error because if we search for a user with an Id that is not a valid object id (longer/shorter) it will give a server error instead 
        if (err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Profile not found'})
        }
        res.status(500).send('Server Error');
    }
})

// @route      DELETE api/profile 
// @desc       Delete profile, user and posts
// @access     Private 
router.delete('/', auth, async(req, res) => {
    try {
        // to do  - remove users posts

        // Remove profile 
        await Profile.findOneAndRemove({ user: req.user.id }); 

        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });
        
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route      PUT api/profile/experience
// @desc       Add profile experience
// @access     Private 
router.put('/experience', 
    [ auth, 
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty()
        ]
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }
        const { title, company, location, from, to, current, description } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp);      //unshift is the same as push but insertion is at the start of the array instead
            
            await profile.save();
            
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }    
)

// @route      DELETE api/profile/experience/:experience_id
// @desc       Delete experience from profile
// @access     Private 
router.delete('/experience/:experience_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        
        //Get remove index
        // const removeIndex = profile.experience.findIndex(experience => experience.id == req.params.experience_id);
        const removeIndex = profile.experience.map(exp => exp.id).indexOf(req.params.experience_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


// @route      PUT api/profile/education
// @desc       Add profile education
// @access     Private 
router.put('/education', 
    [ auth, 
        [
            check('school', 'School is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of study is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty()
        ]
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }
        const { school, degree, fieldofstudy, from, to, current, description } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu);      //unshift is the same as push but insertion is at the start of the array instead
            
            await profile.save();
            
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }    
)

// @route      DELETE api/profile/education/:education_id
// @desc       Delete education from profile
// @access     Private 
router.delete('/education/:education_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        
        //Get remove index
        const removeIndex = profile.education.map(exp => exp.id).indexOf(req.params.education_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})
module.exports = router;

