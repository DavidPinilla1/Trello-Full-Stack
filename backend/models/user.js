const mongoose = require('mongoose');
const bcrypt=require('bcrypt')
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
      },
      password: {
        type: String,
        required: true,
        minlength: 8
      },
      name: {
        type: String,
        maxlength: 90
      },
      lastname: {
        type: String,
        maxlength: 90
      },
      role: {
        type: Number,
        default: 0
      },
      token: {
        type: String
      }
})

userSchema.pre('save', function(next) {
  const user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(SALT_I, (err, salt) => {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
module.exports = mongoose.model('user', userSchema)