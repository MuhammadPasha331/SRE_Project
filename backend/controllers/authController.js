const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await employee.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!employee.isActive) {
      return res.status(403).json({ message: 'Employee account is inactive' });
    }

    const token = jwt.sign(
      { id: employee._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: employee._id,
        username: employee.username,
        name: employee.name,
        position: employee.position,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentUser = (req, res) => {
  try {
    res.json({
      id: req.user._id,
      username: req.user.username,
      name: req.user.name,
      position: req.user.position,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
