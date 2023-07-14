const { Router } = require("express");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const router = new Router();
const salt = 12;

router.get("/signup", (req, res) => {
  res.render("auth/signup.hbs");
});

router.post("/signup", (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username, email and password.",
    });
    return;
  }

  // const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  // if (!regex.test(password)) {
  //   res
  //     .status(500)
  //     .render("auth/signup", {
  //       errorMessage:
  //         "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
  //     });
  //   return;
  // }

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
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: error.message });
      } else if (error.code === 11000) {
        console.log(
          " Username and email need to be unique. Either username or email is already used. "
        );

        res.status(500).render("auth/signup", {
          errorMessage: "User already exists.",
        });
      } else {
        next(error);
      }
    });
});

router.get("/userProfile", (req, res) => {

  res.render('users/user-profile.hbs', { userInSession: req.session.user });

});

router.get('/login', (req, res, next) => {
  res.render('auth/login.hbs')
})

router.post('/login', (req, res, next) => {
  console.log('SESSION =====> ', req.session);
  const { email, password } = req.body;
 
  if (email === '' || password === '') {
    res.render('auth/login.hbs', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }
 
  User.findOne({ email })
    .then(user => {
      if (!user) {
        console.log("Email not registered. ");
        res.render('auth/login', { errorMessage: 'User not found and/or incorrect password.' });
        return;
      } else if (
        bcrypt.compareSync(password, user.passwordHash)) {
        
        req.session.user = user  

        console.log("Sessions after login:", req.session)

        res.redirect('/auth/userProfile')
      } else {
        console.log("Incorrect password. ");
        res.render('auth/login', { errorMessage: 'User not found and/or incorrect password.' });
      }
    })
    .catch(error => next(error));
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect('/auth/login');
  });
});

module.exports = router;
