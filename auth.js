const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const accessTokenSecret = "youraccesstokensecret";
//create a refresh token secret and an empty array to store refresh tokens
const refreshTokenSecret = "yourrefreshtokensecrethere";
let refreshTokens = [];

app.use(bodyParser.json());

const users = [
  {
    username: "john",
    password: "password123admin",
    role: "admin", //get, post, delete, update
  },
  {
    username: "anna",
    password: "password123member",
    role: "member", //get
  },
];

//cada vez que yo me logueo el app me manda 2 token: accessToken Y refreshToken-
//El access token tiene un tiempo para ser usado
app.post("/login", (req, res) => {
  // Read username and password from request body
  const { username, password } = req.body;

  // Filter user from the users array by username and password
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });

  if (user) {
    // Generate an access token
    const accessToken = jwt.sign(
      { username: user.username, role: user.role },
      accessTokenSecret,
      { expiresIn: "59m" }
    );

    //When a user logs in, instead of generating a single token, generate both refresh and authentication tokens:
    const refreshToken = jwt.sign(
      { username: user.username, role: user.role },
      refreshTokenSecret
    );

    refreshTokens.push(refreshToken);

    res.json({
      accessToken,
      refreshToken,
    });
  } else {
    res.send("Username or password incorrect");
  }
});

//Cuando el accessToken expira yo solo mando el refresh token recibido cuando me loguee a este enpoint, el cual me manda de nuevo un access token
//create a request handler that generated new tokens based on the refresh tokens:
app.post("/token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }

  jwt.verify(token, refreshTokenSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign(
      { username: user.username, role: user.role },
      accessTokenSecret,
      { expiresIn: "59m" }
    );

    res.json({
      accessToken,
    });
  });
});

//If the refresh token is stolen from the user, someone can use it to generate as many new tokens as they'd like.
//To avoid this, let's implement a simple logout function:
//When the user requests to logout, we will remove the refresh token from our array. It makes sure that when the user is logged out, no one will be able to use the refresh token to generate a new authentication token.
app.post("/logout", (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);

  res.send("Logout successful");
});

app.listen(6000, () => {
  console.log("Authentication service started on port 6000");
});
