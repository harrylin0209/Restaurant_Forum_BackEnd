const commentServices = require('../../services/comment-services')

const commentController = {
  postComment: (req, res, next) => {
    commentServices.postComment(req, (err, data) => {
      const restaurantId = data.restaurantId
      if (err) return next(err)
      return res.redirect(`/restaurants/${restaurantId}`)
    })
  },
  deleteComment: (req, res, next) => {
    commentServices.deleteComment(req, (err, data) => {
      const restaurantId = data.restaurantId
      if (err) return next(err)
      return res.redirect(`/restaurants/${restaurantId}`)
    })
  }
}
module.exports = commentController
