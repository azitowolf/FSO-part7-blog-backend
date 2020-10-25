const blogsRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request,response) => {
  const blogs = await Blog.find({}).populate('author').populate('comments') // Add the author + comment information to response
  response.json(blogs.map(blog => blog.toJSON()))
})

// TODO should be auth token restricted
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate('author')
    .populate('comments')

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if (body.url === undefined || body.title === undefined) {
    response.status(400).end()
  }

  const token = request.token // will return NULL if none given or not proper format
  const decodedToken = jwt.verify(token, process.env.SECRET) // returns a user object { username: 'example', name: 'example' }

  if (!token || !decodedToken.id) { // no token, or the object decoded from the token does not contain the users identity
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  if (user === null) return response.status(401).json({ error: 'user not found' })

  const blog = new Blog({
    title: body.title,
    author: user._id,
    url: body.url,
    likes: body.likes || 0
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {

  const token = request.token // will return NULL if none given or not proper format
  const decodedToken = jwt.verify(token, process.env.SECRET) // returns a user object { username: 'example', name: 'example' }
  if (!token || !decodedToken.id) { // no token, or the object decoded from the token does not contain the users identity
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = await Blog.findById(request.params.id)
  const user = await User.findById(decodedToken.id)

  if (user.id.toString() === blog.author.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  }
  response.status(401).end()
})

// TODO should be auth token restricted
blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const updatedBlog = await Blog.findByIdAndUpdate({ _id: request.params.id }, body, { new: true })
  response.json(updatedBlog.toJSON())
})

// Comments Endpoint
blogsRouter.post('/:id/comments', async (request, response) => {
  if (request.body.commentBody === undefined) {
    response.status(400).end()
  }
  const comment = new Comment({
    commentBody: request.body.commentBody,
    blog: request.params.id
  })

  const savedComment = await comment.save()
  const blog = await Blog.findById(request.params.id)

  blog.comments.push(savedComment._id)
  blog.save()
  response.json(savedComment.toJSON())
})

blogsRouter.get('/comments', async (response) => {
  const comments = await Comment.find({})
  response.json(comments.map(comment => comment.toJSON()))
})

module.exports = blogsRouter