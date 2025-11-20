const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.urlencoded({ extended: true })); // для чтения формы
app.use(cookieParser());

// Секрет для JWT
const SECRET = "mySecretKey123";

// Главная страница
app.get("/", (req, res) => {
  const token = req.cookies.token;

  // Если токена нет — показываем форму
  if (!token) {
    return res.send(`
      <form method="POST" action="/login">
        <h3>Введите имя:</h3>
        <input name="name" />
        <button>Отправить</button>
      </form>
    `);
  }

  // Если токен есть — пытаемся получить имя
  try {
    const data = jwt.verify(token, SECRET);
    return res.send(`
      <h2>Привет, ${data.name}!</h2>
      <form method="POST" action="/logout">
        <button>Выход</button>
      </form>
    `);
  } catch {
    return res.send("Ошибка токена");
  }
});

// Обработка формы
app.post("/login", (req, res) => {
  const { name } = req.body;

  // Создаём токен
  const token = jwt.sign({ name }, SECRET, { expiresIn: "1h" });

  // Сохраняем в cookie
  res.cookie("token", token, { httpOnly: true });
  res.redirect("/");
});

// Выход
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.listen(3000, () => console.log("Server started..."));