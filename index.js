require("dotenv").config();
const jsonServer = require("json-server");
const morgan = require("morgan");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const PORT = process.env.PORT || 3000;

server.use(middlewares);
server.use(morgan("dev"));

// Middleware to disable CORS
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Mock route for user signup (POST /auth/signup)
server.post("/auth/signup", (req, res) => {
  const { email, password, name } = req.body;

  // Check if the user already exists
  const db = router.db;
  const users = db.get("users").value();

  if (users.some((user) => user.email === email)) {
    // User already exists
    return res.status(400).json({ error: "User already exists" });
  }

  // Add new user to the database
  const newUser = { id: users.length + 1, email, password, name };
  db.get("users").push(newUser).write();

  // Return success response
  return res.status(201).json(newUser);
});

// Mock route for user login (POST /auth/login)
server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  const db = router.db;
  const users = db.get("users").value();

  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    // Invalid credentials
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Return user data (no password for security reasons)
  const { password: userPassword, ...userData } = user;
  return res.status(200).json(userData);
});

// Use default routes from json-server for other data
server.use(router);

server.listen(PORT, () => {
  console.log(`JSON Server is running at port ${PORT}`);
});
