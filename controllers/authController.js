const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User'); // make the reference to the appropriate model

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); // carry on, they are logged in!
    return;
  }
  req.flash('error', 'Oops, you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  //1. See if a user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email was found!');
    return res.redirect('/login');
  };
  //2. Set reset tokens and expiry on their account (make sure these are added to the User schema)
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save(); // wait until the user is actually saved
  //3. Send them an email with the token
  //4. redirect to login page
}; 