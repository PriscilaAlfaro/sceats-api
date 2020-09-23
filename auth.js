//See JWT https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET || "youraccesstokensecret";
const refreshTokenSecret =
  process.env.REFRESH_TOKEN_SECRET || "yourrefreshtokensecrethere"; //create a refresh token secret and an empty array to store refresh tokens
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

//Every time I login, app sendme 2 tokens: accessToken and refreshToken
//Access token has a time to be used
app.post("/login", (req, res) => {
  // Read username and password from request body
  const { username, password } = req.body;

  // Filter user from the users array by username and password
  //This should be checked in dababase
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

//When accessToken expires, I send the refreshToken that I received the first time I login in the app  (to the token endpoint), and I receive a new accessToken.
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
