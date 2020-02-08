const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile')
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try{
    const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);
    if(!profile){
      return res.status(400).send({msg: 'No profile for this user'});
    }
    res.send(profile);
  }catch(e){
    console.error(e.message);
    res.status(500).send('SERVER ERROR')
  }
});

module.exports = router;
