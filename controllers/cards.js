const Card = require('../models/card');
const opts = {
  new: true,
  runValidators: true
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then(cards => res.send({ data: cards }))
    .catch(err => res.status(500).send({ message: err.message }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then(card => res.send({ data: card }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании карточки"
        })
      }
      return res.status(500).send({ message: err.message })
    })
};


module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card) {
        return res.status(201).send({ data: card })
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(404).send({
          message: "Карточка по указанному id не найдена"
        })
      }
      return res.status(500).send({ message: err.message })
    })
}

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    opts
  ).then((card) => {
    if (card) {
      return res.status(201).send({ data: card })
    }
  })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(404).send({
          message: "Карточка по указанному id не найдена"
        })
      }
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные для снятии лайка"
        })
      }
      return res.status(500).send({ message: err.message })
    })
}

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    opts
  ).then((card) => {
    if (card) {
      return res.status(201).send({ data: card })
    }
  })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(404).send({
          message: "Карточка по указанному id не найдена"
        })
      }
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные для снятии лайка"
        })
      }
      return res.status(500).send({ message: err.message })
    })
}

