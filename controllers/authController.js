const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User'); // make the reference to the appropriate model
const promisify = require('es6-promisify');
const mail = require('../handlers/mail'); // import mail library

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
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    user,                       // user: user
    subject: 'Password Reset',
    resetURL,                   // resetURL: resetURL
    filename: 'password-reset'  // when rendering out the HTML, this will look for password-reset.pug
  });
  req.flash('success', `You have been emailed a password reset link. Be sure to check your Spam/Junk folder!`); // DO NOT USE LIVE - TEST LINE - NOT SECURE ! ! !
  //4. redirect to login page
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,     // check if token is equal to the token that the user knows (from email) and submits
    resetPasswordExpires: { $gt: Date.now() } // check if 'Expires' is greater than (gt) now, aka in the future (if so: valid, otherwise: expired)
  });
  if (!user) { 
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  };
  // if there is a user, show the reset password form
  res.render('reset', { title: 'Reset your password' });
};

exports.confirmedPasswords = (req, res, next) => {
  if(req.body.password === req.body['password-confirm']) {
    next(); // keep it going
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,     // check if token is equal to the token that the user knows (from email) and submits
    resetPasswordExpires: { $gt: Date.now() } // check if 'Expires' is greater than (gt) now, aka in the future (if so: valid, otherwise: expired)
  });

  if (!user) { 
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  };

  // setPassword() (method from the passportLocalMongoose plugin in User.js) is not promisified by default
  // >> workaround: 1) import promisify at the top of this file, 2) promisify 'manually' as follows:
  const setPassword = promisify(user.setPassword, user); // promisify user.setPassword, binding it to user
  
  // handle the pw reset DB side:
  await setPassword(req.body.password); // sets the new pw, hashes and salts it 
  user.resetPasswordToken = undefined; // get rid of this field in MongoDB by setting it to undefined;
  user.resetPasswordExpires = undefined; // " " " " " " " " " " " " " " " " " " " " " " " " " " " " 
  const updatedUser = await user.save(); // actually saves the above steps
  await req.login(updatedUser); // auto login the user
  req.flash('success', 'Nice! Your password has been reset! You are now logged in!');
  res.redirect('/');

};