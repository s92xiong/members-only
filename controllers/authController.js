const User = require("../models/userModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

exports.signup_get = (req, res, next) => {
  res.render("signup", { title: "Sign Up" });
};

exports.signup_post = [
  body("username").trim().isLength({ min: 1 }).escape().withMessage("Username must be at least 6 characters."),
	body("password").trim().isLength({ min: 1 }).escape().withMessage("Password must be at least 6 characters."),
  body("confirmPassword").trim().isLength({ min: 1 }).escape().withMessage("Password must be at least 6 characters.")
    .custom(async (value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords must be the same');
      return true;
    }),

  async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("ERROR!");
      return res.render("signup", { title: "Sign Up", passwordConfirmationError: "Passwords must be the same" });
    }

    try {
      const isUserInDB = await User.find({ "username": req.body.username });
      if (isUserInDB.length > 0) return res.render("signup", { title: "Sign Up", error: "User already exists" });
      // If username does not exist, continute to register new user to db
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) return next(err);
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          member: false,
          admin: false
        }).save(err => err ? next(err) : res.redirect("/"));
      });
    } catch (err) {
      return next(err);
    }
  }
];

exports.login_get = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
  // failureFlash: true
});

exports.logout_get = (req, res) => {
  req.logout();
  res.redirect("/");
}

exports.member_get = (req, res, next) => {
  if (!res.locals.currentUser) {
    // User cannot access the members form unless logged in
    return res.redirect("/log-in");
  } else {
    return res.render("member_form", { title: "Become a Member", user: res.locals.currentUser  });
  }
};

exports.member_post = async (req, res, next) => {
  // If user is logged in, show the members tab
    // If user is not logged in and tries to go to "members" url, re-route them to the login-page
  // 1. Find the current user that is logged in
  // 2. Update the user's member status to true
  console.log(req.user);
};