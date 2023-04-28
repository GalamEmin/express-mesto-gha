const Card = require('../models/card');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const Forbidden = require('../errors/Forbidden');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((newCard) => {
      if (!newCard) {
        return next(new NotFoundError('Объект не найден'));
      } return res.send({ data: newCard });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные'));
        return;
      } next(err);
    });
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (!cards) {
        return next(new NotFoundError('Объект не найден'));
      } return res.send({ data: cards });
    })
    .catch(next);
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (card == null) {
        throw new NotFoundError('Объект не найден');
      } else if (String(card.owner) !== req.user._id) {
        throw new Forbidden('Доступ ограничен');
      } return Card.findByIdAndRemove(req.params.cardId)
        .then((removedCard) => {
          res.send({ data: removedCard });
        });
    })
    .catch(next);
};

module.exports.putCardLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((cards) => {
      if (cards == null) {
        throw new NotFoundError('Объект не найден');
      } res.send({ data: cards });
    })
    .catch(next);
};

module.exports.deleteCardLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((cards) => {
      if (cards == null) {
        throw new NotFoundError('Объект не найден');
      } res.send({ data: cards });
    })
    .catch(next);
};
