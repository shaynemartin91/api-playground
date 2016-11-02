const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const express = require('express');
const inflect = require('i')();

const router = express.Router();

module.exports = (config) => {
  const pluralModelName = config.plural_model_name || inflect.pluralize(config.model_name);
  const properModelName = config.proper_model_name || inflect.titleize(config.model_name);
  const actionsPath = `../actions/${config.model_name}`;

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const Actions = require(actionsPath);
  const PostAction = Actions[`${properModelName}PostAction`];
  const EditAction = Actions[`${properModelName}EditAction`];
  const DeleteAction = Actions[`${properModelName}DeleteAction`];

  const defaultModel = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'data', 'defaults', `${pluralModelName}.json`),
    'utf8'));

  const dataPath = theme => path.join(__dirname, '..', 'data', 'themes', theme, `${pluralModelName}.json`);

  const cleanData = function cleanData(record, newData) {
    return Object.assign(
      {},
      defaultModel,
      record,
      _.pick(newData, ...Object.keys(defaultModel))
    );
  };

  const cleanCollection = collection => collection.filter(r => !r.deleted);

  router.use((req, res, next) => {
    if (!req.session.actions.hasOwnProperty(config.model_name)) {
      req.createActionSet(config.model_name);
    }

    req.setValue('base_collection', JSON.parse(fs.readFileSync(dataPath(req.session.theme), 'utf8')));
    req.setValue('collection', req.session.actions.user.run(req.base_collection));

    req.setValue('updateCollection', (action) => {
      req.setValue('collection', action.run(req.collection));
    });

    next();
  });

  /* GET users listing. */
  router.get('/', (req, res) => {
    res.json(cleanCollection(req.collection));
  });

  router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const record = _.findWhere(req.collection, { id });

    if (record && !record.deleted) {
      res.json(record);
    } else {
      res.status(404).json({
        success: false,
        status: 404,
        message: 'This record does not exist',
        meta: {
          id,
        },
      });
    }
  });

  router.post('/', (req, res) => {
    const action = new PostAction(cleanData({}, req.body));
    const validation = action.validate();

    if (!validation.success) {
      res.status(validation.status).json(validation);
    } else {
      req.session.actions.user.add(action);
      req.updateCollection(action);
      res.json(req.collection[req.collection.length - 1]);
    }
  });

  router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const record = _.findWhere(req.collection, { id }) || {};
    const data = cleanData(record, req.body);
    const action = new EditAction(Object.assign({}, data, { id }));

    const validation = action.validate(req.collection);

    if (!validation.success) {
      res.status(validation.status).json(validation);
    } else {
      req.session.actions.user.add(action);
      req.updateCollection(action);
      res.json(_.findWhere(req.collection, { id }));
    }
  });

  router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const action = new DeleteAction(id);
    const validation = action.validate(req.collection);

    if (!validation.success) {
      res.status(validation.status).json(validation);
    } else {
      req.session.actions.user.add(action);
      req.updateCollection(action);
      res.json(cleanCollection(req.collection));
    }
  });


  return router;
};
