/**
 * @abstract
 * Repository pattern — data access only (MongoDB via Mongoose).
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findById(id, options = {}) {
    return this.model.findById(id, null, options);
  }

  findOne(filter, options = {}) {
    return this.model.findOne(filter, null, options);
  }

  find(filter = {}, options = {}) {
    return this.model.find(filter, null, options);
  }

  create(data) {
    return this.model.create(data);
  }

  updateById(id, data, options = { new: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = { BaseRepository };
