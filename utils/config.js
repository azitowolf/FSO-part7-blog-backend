require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI
let MONGODB_TEST_URI = process.env.MONGODB_TEST_URI

module.exports = {
  MONGODB_URI,
  MONGODB_TEST_URI,
  PORT
}