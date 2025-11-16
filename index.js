const express = require("express");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.set("trust proxy", 1); // обязательно для Render

app.use(express.json());

app.use(cors({
  origin: "https://sponsor-ic6r.onrender.com",
  credentials: true
}));

app.use(session({
  secret: "mySecretKey123",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    sameSite: "none",
    secure: true
  }
}));

app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "No username" });

  req.session.user = { username };
  res.json({ message: "Logged in" });
});

app.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

app.listen(3000, () => console.log("Server started..."));