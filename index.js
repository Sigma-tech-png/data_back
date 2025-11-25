import express from "express"
import cookieParser from "cookie-parser"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.DOMEN,
    credentials: true,
  })
)

const users = []
const ACCESS_KEY = "ACCESS_SECRET"

function makeToken(id) {
  return jwt.sign({ id }, ACCESS_KEY, { expiresIn: "10m" })
}

function auth(req, res, next) {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: "no token" })

  jwt.verify(token, ACCESS_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "expired" })
    req.user = decoded
    next()
  })
}

// ============================
//       REGISTER
// ============================
app.post("/register", async (req, res) => {
  const { name, username, password } = req.body

  if (users.find((u) => u.username === username))
    return res.status(400).json({ message: "exists" })

  const hash = await bcrypt.hash(password, 10)
  const user = { id: Date.now(), name, username, password: hash }
  users.push(user)

  const token = makeToken(user.id)

  res
    .cookie("token", token, { httpOnly: true })
    .json({ name: user.name })
})

// ============================
//         LOGIN
// ============================
app.post("/login", async (req, res) => {
  const { username, password } = req.body
  const user = users.find((u) => u.username === username)

  if (!user) return res.status(400).json({ message: "not found" })

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: "wrong pass" })

  const token = makeToken(user.id)

  res
    .cookie("token", token, { httpOnly: true })
    .json({ name: user.name })
})

// ============================
//          ME
// ============================
app.get("/me", auth, (req, res) => {
  const user = users.find((u) => u.id === req.user.id)
  res.json({ name: user.name })
})

// ============================
//        LOGOUT
// ============================
app.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "logout ok" })
})

app.listen(4000, () => console.log("Server on 4000"))