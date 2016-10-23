const Actions = require('./index');

class ActionSet {
  constructor(type, parse) {
    this.actions = new Set();
    
    if(!parse)
      this.type = type;
    else
      this.deserialize(type);
  }

  add(value) { return this.actions.add(value); }
  
  serialize(transform, spacer) { 
    return JSON.stringify({
        type: this.type,
        actions: [...this.actions].map(action => action.serialize(false)),
      },
      transform,
      spacer
    ); 
  }

  deserialize(data) {
    const expanded = JSON.parse(data);
    this.type = expanded.type;

    expanded.actions
      .map(action => {
        let actionType = Object.keys(Actions).filter(key => Actions[key].name === action.type );

        if(actionType.length)
          actionType = actionType[0];
        else
          return null;
        
        return (Actions[actionType]).deserialize(action.data);
      })
      .forEach(action => this.add(action));
  }

  run(collection) {
    this.actions.forEach(action => collection = action.run(collection));

    return collection;
  }
}

module.exports = ActionSet;