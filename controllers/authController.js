const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- 1. REGISTER USER ---
exports.register = async (req, res) => {
  try {
    const { name, username, password, banks } = req.body; // ✅ Added banks to destructuring

    if (!name || !username || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name, 
      username, 
      password: hashedPassword,
      banks: banks && banks.length > 0 ? banks : ['Cash (Wallet)'], // ✅ Use provided banks or default
      cycleStartDay: 1
    });
    
    await user.save();

    const payload = { user: { id: user._id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user._id, 
            name: user.name, 
            username: user.username, 
            cycleStartDay: user.cycleStartDay,
            banks: user.banks  // ✅ Return banks
          } 
        });
      }
    );
  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
};

// --- 2. LOGIN USER ---
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user._id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user._id, 
            name: user.name, 
            username: user.username, 
            cycleStartDay: user.cycleStartDay,
            banks: user.banks  // ✅ Return banks
          } 
        });
      }
    );
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// --- 3. GET CURRENT USER ---
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

//4 In authController.js, update the updateProfile function:

exports.updateProfile = async (req, res) => {
  const { name, username, profilePic, banks, defaultBank, password, cycleStartDay } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    console.log('Received update - defaultBank:', defaultBank);

    // Handle Username Uniqueness
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ msg: 'Username is already taken' });
      }
      user.username = username;
    }

    // Update Basic Fields
    if (name) user.name = name;
    if (profilePic) user.profilePic = profilePic;
    if (banks) user.banks = banks;
    if (defaultBank) user.defaultBank = defaultBank;
    if (cycleStartDay !== undefined && cycleStartDay !== null) {
      user.cycleStartDay = cycleStartDay;
    }

    // Handle Password Update
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};