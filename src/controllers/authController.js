const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { logEvent } = require('../utils/logger');

const dbPath = path.join(__dirname, '../../db.json');

// Load users
function loadUsers() {
  if (!fs.existsSync(dbPath)) return [];
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
}

// Save users
function saveUsers(users) {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

const registerUser = (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashedPassword });
  saveUsers(users);

  logEvent(`User registered: ${username}`);
  res.status(201).json({ message: 'User registered successfully' });
};

const loginUser = (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    logEvent(`Failed login attempt: ${username}`);
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, 'SECRET_KEY', { expiresIn: '1h' });
  logEvent(`User logged in: ${username}`);
  res.json({ message: 'Login successful', token });
};

module.exports = { registerUser, loginUser };
