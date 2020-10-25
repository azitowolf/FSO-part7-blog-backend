const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  { title:'Why Conspiracy theories are so appealing',
    url:'fake.endpoint.com',
    likes:'15' }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  let testingUser = {
    username: 'J-Money',
    name: 'Joaqin Phoenix',
    password: 'test'
  }

  // note: should seed through the API as this will transform the password --> passwordHash
  await api.post('/api/users')
    .send(testingUser)

  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()

})

test('database seeded', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body.length).toEqual(1)
  const response2 = await api.get('/api/users')
  expect(response2.body.length).toEqual(1)

})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(initialBlogs.length)
})

test('objects have id property formatted correctly', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('new blog can be created for a given user 可以创建新博客', async () => {
  const newBlog = {
    title:'Modern romance',
    url:'fake.endpoint.com',
    likes:'0'
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username:'J-Money', password: 'test' })
    .expect(200)

  expect(loginResponse.body.token).toBeDefined()

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${loginResponse.body.token}`)
    .set('Content-Type', 'application/json')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

})

// test adding blog fails without auth token
test('new blog can\'t be created without token 可以创建新博客', async () => {
  const newBlog = {
    title:'Modern romance',
    url:'fake.endpoint.com',
    likes:'0'
  }

  await api
    .post('/api/blogs')
    .set('Content-Type', 'application/json')
    .send(newBlog)
    .expect(401)

})

test('new blog without likes defined defaults to 0', async () => {

  const newBlogWithoutLikes = {
    title:'Neuroses',
    url:'fake.endpoint.com'
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username:'J-Money', password: 'test' })
    .expect(200)

  expect(loginResponse.body.token).toBeDefined()

  const postedBlog = await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${loginResponse.body.token}`)
    .send(newBlogWithoutLikes)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(postedBlog.body).toBeTruthy()
  expect(postedBlog.body.likes).toEqual(0)

})

test('POST new blog without title or url returns 400', async () => {
  const newBlog = {
    author:'Aziz Ansari',
    likes:'12'
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username:'J-Money', password: 'test' })
    .expect(200)

  expect(loginResponse.body.token).toBeDefined()

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${loginResponse.body.token}`)
    .send(newBlog)
    .expect(400)
})

afterAll(() => {
  mongoose.connection.close()
})