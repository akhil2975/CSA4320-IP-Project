const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();

// MongoDB User model
const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String,
});

// Middleware to parse POST request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (replace with your connection string)
mongoose.connect('mongodb://localhost:27017/loginSystem', { useNewUrlParser: true, useUnifiedTopology: true });

// Registration endpoint
app.post('/register-submit', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match.');
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists.');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(200).send('Registration successful. Please login.');
  } catch (err) {
    res.status(500).send('Server error. Please try again later.');
  }
});

// Login endpoint
app.post('/login-submit', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found.');
    }

    // Compare the password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Incorrect password.');
    }

    // Successfully logged in
    res.status(200).send('Login successful');
  } catch (err) {
    res.status(500).send('Server error. Please try again later.');
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
