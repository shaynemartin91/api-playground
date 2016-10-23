class ActionHelper {
  static getCollectionItemById(collection, id) {
    const idx = collection.findIndex(datum => datum.id === id);
    return idx > -1 ? collection[idx] : null;
  }

  static getNextId(collection) {
    const sorted = collection.sort((a, b) => {
      if(a.id < b.id)
        return -1;
      if(a.id > b.id)
        return 1;
      
      return 0;
    });

    return sorted[sorted.length -1].id + 1;
  }

  static prep(collection) {
    return collection.filter(d => !Action.isDeleted(collection, d.id));
  }

  static existsInCollection(collection, id) {
    return collection.findIndex(datum => datum.id === id);
  }

  static deleteFromCollection(collection, id) {
    if(!Array.isArray(collection.deleted))
      collection.deleted = [];

    collection.deleted.push(id);

    return collection;
  }

  static isDeleted(collection, id) {
    return Array.isArray(collection.deleted) && collection.deleted.indexOf(id) > -1
  }
}

module.exports = ActionHelper;