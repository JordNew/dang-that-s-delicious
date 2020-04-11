// this handler will configure the passport for the appropriate platform (e.g. facebook, github etc. - in this case: local)

const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());

// with every request, what to do with the actual user now that they have confirmed to be properly logged in:
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


