const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const InvalidDataError = require('../errors/invalid-data-err');
const NotEnoughRightsError = require('../errors/not-enough-rights-err');

const opts = {
  new: true,
  runValidators: true,
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((card) => res.status(200).send({ card }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new InvalidDataError('Переданы некорректные данные при создании карточки');
      }
    })
    .catch(next);
};

module.exports.deleteCardById = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  return Card.findById(cardId).orFail(() => new Error('NotFound'))
    .then((cardById) => {
      if (cardById.owner.equals(userId)) {
        return Card.findByIdAndRemove(cardId).orFail(() => new Error('NotFound'))
          .then((card) => res.status(202).send({ card }))
          .catch(next);
      }
      throw new Error('NotEnoughRights');
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Нет карточки с таким id');
      }
      if (err.message === 'NotEnoughRights') {
        throw new NotEnoughRightsError('Недостаточно прав для удаления чужой карточки');
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new InvalidDataError('Переданы некорректные данные для удаления карточки');
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    opts,
  ).orFail(() => new Error('NotFound')).then((card) => res.status(202).send({ card }))
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Нет карточки с таким id');
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new InvalidDataError('Переданы некорректные данные для установки лайка');
      }
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    opts,
  ).orFail(() => new Error('NotFound')).then((card) => res.status(202).send({ card }))
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Нет карточки с таким id');
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new InvalidDataError('Переданы некорректные данные для снятия лайка');
      }
    })
    .catch(next);
};
