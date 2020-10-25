const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, likes: 1 })
  response.json(users.map(u => u.toJSON()))
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('blogs', { title: 1, likes: 1 })
  response.json(user)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body
  let passwordHash = undefined

  if (body.password) {
    if (body.password.length < 3) {
      return response.status(400).json({
        error: 'YO make your password longer'
      })
    }
    const saltRounds = 10
    passwordHash = await bcrypt.hash(body.password, saltRounds)
  }

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash: passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

module.exports = usersRouter