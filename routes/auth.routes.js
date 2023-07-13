const { Router } = require("express");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const router = new Router();
const salt = 12;

router.get("/signup", (req, res) => {
  res.render("auth/signup.hbs");
});

router.post("/signup", (req, res, next) => {
  const { username, email, password } = req.body;

  bcrypt
    .genSalt(salt)
    .then((salts) => {
      return bcrypt.hash(password, salts);
    })
    .then((hashedPass) =>
      User.create({ username, email, passwordHash: hashedPass }).then(
        (createdUser) => res.redirect("/auth/userProfile")
      )
    )
    .catch((err) => console.log(err));
});

router.get("/userProfile", (req, res) => {
  res.render("users/user-profile.hbs");
});

module.exports = router;
