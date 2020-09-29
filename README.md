# sceats-api
REST API of restaurants 
This project simulates a small REST API of restaurants and corresponds to an academic practice of the SmartCoding Junior full-stack programer course.

# Composition
It has a master branch and a branch named database.
In **master** you will find an example of endpoints that read from an array of restaurants.
In **database** there are the same endpoints as in master, but it has a connection to a database through mongoose, as well as an authorization module. For authorization, access by roles was used with data from an array within the application.

# Installation
1. Install Nodejs
2. Install MongoDB
3. Use ` npm install ` to download other dependencies.

# How to run
1. In master:
- `node run dev` it will run by default on http://localhost/5000

2. In dabatase branch:
- `node run dev` it will run by default on http://localhost/5000
- ` node auth.js` it will run by default on http://localhost/6000

# Technologies
- The project is developed in Node.js, using Express.
- MongoDB database through mongoose.
- JWT to authorize access to the REST API endpoints.

© Priscila Alfaro
