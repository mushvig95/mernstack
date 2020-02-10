const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).send({ msg: "No profile for this user" });
    }
    res.send(profile);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("SERVER ERROR");
  }
});

// @route   POST api/profile/me
// @desc    create or update user profile
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills are require")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    // creating user profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    req.body.company ? (profileFields.company = req.body.company) : null;
    req.body.website ? (profileFields.website = req.body.website) : null;
    req.body.location ? (profileFields.location = req.body.location) : null;
    req.body.bio ? (profileFields.bio = req.body.bio) : null;
    req.body.status ? (profileFields.status = req.body.status) : null;
    req.body.githubusername
      ? (profileFields.githubusername = req.body.githubusername)
      : null;
    req.body.skills
      ? (profileFields.skills = req.body.skills
          .split(",")
          .map(skill => skill.trim()))
      : null;
    // creating socials
    profileFields.social = {};
    req.body.youtube ? (profileFields.social.youtube = req.body.youtube) : null;
    req.body.twitter ? (profileFields.social.twitter = req.body.twitter) : null;
    req.body.facebook
      ? (profileFields.social.facebook = req.body.facebook)
      : null;
    req.body.linkedin
      ? (profileFields.social.linkedin = req.body.linkedin)
      : null;
    req.body.instagram
      ? (profileFields.social.instagram = req.body.instagram)
      : null;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      // UPDATE PROFILE IF EXISTS
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.send(profile);
      }
      // UPDATE PROFILE IF EXISTS
      profile = new Profile(profileFields); // instance of a model
      await profile.save();
      res.json(profile);
    } catch (e) {
      console.error(e.message);
      res.status(500).send("SERVER ERROR");
    }
  }
);

// @route   GET api/profile/
// @desc    get all profiles
// @access  Private
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/profile/:user_id
// @desc    get profile by user_id
// @access  Private
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
    profile
      ? res.json(profile)
      : res.status(400).send({ msg: "No such profile" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/profile/:user_id
// @desc    delete profile, user and posts
// @access  Private
router.delete("/", auth, async (req, res) => {
  try {
    // @TODO: Remove user's posts

    // REMOVE PROFILE
    await Profile.findOneAndRemove({ user: req.user.id });

    // REMOVE USER
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty(),
      check("from", "From date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.aray() });
    }

    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.send(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile by id
// @access  Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error occured" });
  }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required")
        .not()
        .isEmpty(),
      check("degree", "Degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Field of study is required")
        .not()
        .isEmpty(),
      check("from", "From date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.aray() });
    }

    const newEd = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEd);
      await profile.save();
      res.send(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/profile/education/:exp_id
// @desc    Delete education from profile by id
// @access  Private
router.delete("/education/:ed_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.ed_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error occured" });
  }
});

module.exports = router;
