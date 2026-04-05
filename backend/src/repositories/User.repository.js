const { BaseRepository } = require('./Base.repository');
const UserModel = require('../models/User.model');

class UserRepository extends BaseRepository {
  constructor() {
    super(UserModel);
  }

  findByPhone(phone) {
    return this.model.findOne({ phone });
  }

  countUsers() {
    return this.model.countDocuments();
  }
}

module.exports = { UserRepository };
