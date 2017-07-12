const passport = require('passport');
const mongoose = require('mongoose');
const User     = mongoose.model('User');

passport.use(User.createStrategy());  // Whats gonna happen when user login

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
