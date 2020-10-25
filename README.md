# Part 4

a. Structure of backend application, introduction to testing
b. Testing the backend
c. User administration
d. Token authentication

## Parts a + b : Refactoring a node.js application backend

* Application running in a single file (little refactoring)
    * config package.json + add all npm modules required for app
        * Essential for dev: 
            * nodemon or other live reloading server (nodemon must be run through node scripts)
            * eslint for logging
    * mongoDB created if needed connection string configured correctly for DB
    * **TEST : All routes and corresponding reactions on the server and in DB** 
* Separating config + configuring environments
    * .env variables into seperate
* Separate Router into "controller" module
    * use express.Router to export this module
* Separate Mongoose or model data into separate module
    * validation for the models (npm install --save mongoose-unique-validator)
* Create utils modules
    * middleware for req handling
    * logger for handling logs
    * config for .env variable setting
* App component separate from index.js.
    * final refactor step. 
    * Index.js just initiates express app, starts server on port
    * const app = require('./app') // the actual Express application
    * const server = http.createServer(app)
* Add Function Tests
    * use jest (https://jestjs.io/docs/en/api.html)
    * test.[filename].js
    * install with NPM, add to eslint config as well as package.json scripts
* Add API Tests
    * Configure DB to connect to development version for testing
        * Install 'cross-env' npm 
        * Add new MONGODB_URI to config file
        * Seed DB with data for testing
        * Separate seeding, fake ID creation into seperate helper module
* Models connected through linking IDs
    * reference ids created in models
    ```javascript
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
    ```
    * passwords hashed appropriately (npm install bcrypt --save)
    * POST routes updated to update all associated objects on save
    * GET routes updated to populate associated data in leiu of relational DB (mongo specific)
    ```javascript
    const users = await User.find({}).populate('notes', { content: 1, date: 1 })
    ```
## Parts c + d : User Admin + Authentication

Modules for these sections

```javascript
npm install bcrypt --save
npm install jsonwebtoken --save
npm install mongoose-unique-validator --save
npm istall jest --save
```

### User Administration

* |User| one --- many |Note|
* Add this relationship in Mongoose Models 
```javascript
type: mongoose.Schema.Types.ObjectId,
ref: 'Note'
```
* Populate function to add any additional info needed to user model (IE related posts, etc)
* Adjust the users route to salt and hash the password on user create = const passwordHash = await bcrypt.hash(body.password, saltRounds)
* Adjust resources so that they can be assigned to a user

### Token Based Authentication

Flow for token based auth is as follows:

(https://scotch.io/tutorials/the-ins-and-outs-of-token-based-authentication#toc-how-token-based-works)
User starts by logging in using a login form implemented with React
This causes the React code to send the username and the password to the server address /api/login as a HTTP POST request.
If the username and the password are correct, the server generates a token which somehow identifies the logged in user.
The backend responds with a status code indicating the operation was successful, and returns the token with the response.
The browser saves the token, for example to the state of a React application.
When the user creates a new note (or does some other operation requiring identification), the React code sends the token to the server with the request.
The server uses the token to identify the user

* make login.js seperate controller file
    * logic to find user, check if pw is correct, and return user and a token
* edits to resources (blog posts, notes, etc.)
    * logic to to get the token, decode it, find the user, and then make the note and assign ownership to that user 
* edits to testing suite
    * add authorization header
    ```javascript
    POST http://localhost:3001/api/notes
    Content-Type: application/json
    Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ ...

    {
        "content": "Beauty is in the eye of the beholder",
        "important": false
    }
    ```
* limit access to routes to authenticated users