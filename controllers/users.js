const User = require('../models/user');
const opts = {
  new: true,
  runValidators: true
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then(users => res.send({ data: users }))
    .catch(err => res.status(500).send({ message: err.message }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        return res.status(201).send({ data: user })
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(404).send({
          message: "Пользователь по указанному id не найден"
        })
      }
      return res.status(500).send({ message: err.message })
    })
}

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании пользователя"
        })
      }
      return res.status(500).send({ message: err.message })
    })
}

module.exports.updateUserProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name: name, about: about }, opts,
  )
    .then((user) => {
      if (user) {
        return res.status(201).send({ data: user })
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(404).send({
          message: "Пользователь по указанному id не найден"
        })
      }
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при обновлении профиля"
        })
      }
      return res.status(500).send({ message: err.message })
    })
}

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar: avatar }, opts)
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(404).send({
          message: "Пользователь по указанному id не найден"
        })
      }
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при обновлении аватара"
        })
      }
      return res.status(500).send({ message: err.message })
    })
};

