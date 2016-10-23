const _ = require('underscore');
const express = require('express');
const router = express.Router();
const ActionSet = require('../actions/ActionSet');
const inflect = require('i')();

module.exports = config => {  
  
  config.plural_model_name = config.plural_model_name || inflect.pluralize(config.model_name);
  config.proper_model_name = config.proper_model_name || inflect.titleize(config.model_name); 
  
  const Actions = require(`../actions/${config.model_name}`);
  const PostAction = Actions[`${config.proper_model_name}PostAction`];
  const EditAction = Actions[`${config.proper_model_name}EditAction`];
  const DeleteAction = Actions[`${config.proper_model_name}DeleteAction`];
  
  const default_model = require(`../data/defaults/${config.plural_model_name}.json`);

  const data_path = theme => `../data/themes/${theme}/${config.plural_model_name}.json`; 
  
  const clean_data = (record, new_data) => {
    return Object.assign(
      {}, 
      default_model,
      record,
      _.pick(new_data, ...Object.keys(default_model))
    );
  };

  const clean_collection = collection => collection.filter(r => !r.deleted);

  router.use((req, res, next) => {
    if(!req.session.actions.hasOwnProperty(config.model_name))
      req.session.actions[config.model_name] = new ActionSet(config.model_name);
    
    req.base_collection = require(data_path(req.session.theme));
    req.collection = req.session.actions.user.run(req.base_collection);
    
    next();
  });

  /* GET users listing. */
  router.get('/', function(req, res, next) {
    res.json(clean_collection(req.collection));
  });

  router.get('/:id', function(req, res, send){
    const id = parseInt(req.params.id);
    const record = _.findWhere(req.collection, {id});

    if(record && !record.deleted) 
      res.json(record)
    else
      res.status(404).json({
        success: false,
        status: 404,
        message: 'This record does not exist',
        meta: {
          id
        }
      });
  });

  router.post('/', (req, res, next) => {
    const action = new PostAction(clean_data({}, req.body));
    const validation = action.validate();

    if(!validation.success) {
      res.status(validation.status).json(validation);
    } else {
      req.session.actions.user.add(action);
      req.collection = action.run(req.collection);
      res.json(req.collection[req.collection.length - 1]);
    }
  });

  router.put('/:id', (req, res, next) => {
    const record = _.findWhere(req.collection, {id: parseInt(req.params.id)}) || {};
    const data = clean_data(record, req.body);
    const action = new EditAction(Object.assign({}, data, {id: parseInt(req.params.id)}));
    
    const validation = action.validate(req.collection);

    if(!validation.success) {
      res.status(validation.status).json(validation)
    } else {
      req.session.actions.user.add(action);
      req.collection = action.run(req.collection);
      res.json(_.findWhere(req.collection, {id: parseInt(req.params.id)}));
    }
  });

  router.delete('/:id', (req, res, next) => {
    const action = new DeleteAction(parseInt(req.params.id));
    const validation = action.validate(req.collection);

    if(!validation.success) {
      res.status(validation.status).json(validation);
    } else {
      req.session.actions.user.add(action);
      req.collection = action.run(req.collection);
      res.json(clean_collection(req.collection));
    }
  });


  return router;

};