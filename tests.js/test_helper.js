const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  { title:'Why Conspiracy theories are so appealing',
    author:'hans jerasdfbsadf',
    url:'fake.endpoint.com',
    likes:'15' }
]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(Blog => Blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb
}