const express = require("express");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());

// Настройка CORS для React
app.use(cors({
  origin: process.env.DOMEN, // http://localhost:5173
  credentials: true // важно, чтобы куки передавались
}));

// Настройка сессий
app.use(session({
  secret: "mySecretKey123",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,

    sameSite: "none", // важно для продакшена
    secure: true // cookie только через HTTPS
  }
}));

// Пример авторизации
app.post("/login", (req, res) => {
  const { username } = req.body;
  if(!username) return res.status(400).json({error: "No username"});
  
  // Сохраняем пользователя в сессии
  req.session.user = { username };
  res.json({ message: "Logged in" });
});

// Проверка сессии
app.get("/me", (req, res) => {
  if(req.session.user){
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

app.listen(3000, () => console.log("Server started on 3000..."));