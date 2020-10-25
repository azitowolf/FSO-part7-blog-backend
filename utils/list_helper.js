const totalLikes = (listOfBlogs) => {

  if (listOfBlogs.length === 1) {return listOfBlogs[0].likes}
  const reducer = (accumulator, blog) => accumulator.likes + blog.likes
  return listOfBlogs.reduce(reducer)

}

const favoriteBlog = (listOfBlogs) => {

  const format = (title, author, likes) => {
    return {
      title,
      author,
      likes,
    }
  }

  if (listOfBlogs.length === 1) {
    const blog = listOfBlogs[0]
    return format(blog.title, blog.author, blog.likes)
  }

  const getMax = listOfBlogs.reduce((max, blog) => blog.likes > max.likes ? blog : max)

  return format(getMax.title, getMax.author, getMax.likes)
}

module.exports = {
  totalLikes,
  favoriteBlog,
}