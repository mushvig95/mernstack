const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

router.post(
  "/",
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
  ],
  async (req, res) => {
    const errors = validationResult(req);
  
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
    }
  
    const {name, password, email} = req.body;
  
    try{
      let user = await User.findOne({email});

      if(user) {
        return res.status(400).json({errors: [{msg: 'User already exists'}]});
      }

      const avatar = gravatar.url(email,{
        s: '200', // size
        r: 'pg',   // rating
        d: 'mm'  // default
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id   // user._id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {expiresIn: 36000},
        (err, token) => {
          if(err){
            throw new Error
          }
          res.json({token});
        }
      );

      // res.send("USERS REGISTERED");
    }catch(e){
      return res.status(500).send('SERVER ERROR');
    }
  }
);

module.exports = router;
