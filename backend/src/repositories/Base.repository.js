/**
 * PATTERN: Repository
 * Abstract base repository providing CRUD + pagination for all models.
 * All domain repositories extend this class.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, populate = '', options = {}) {
    const query = this.model.findById(id).populate(populate);
    if (options.session) query.session(options.session);
    return query.setOptions({ ...options, session: undefined }).lean();
  }

  async findOne(filter, populate = '', options = {}) {
    return this.model.findOne(filter).populate(populate).setOptions(options).lean();
  }

  async findAll(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      populate = '',
      select = '',
      session,
    } = options;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .select(select)
        .session(session)
        .lean(),
      this.model.countDocuments(filter).session(session),
    ]);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async create(data, options = {}) {
    // Array creation with sessions requires [data, options]
    if (Array.isArray(data)) {
      return this.model.create(data, options);
    }
    const [doc] = await this.model.create([data], options);
    return doc;
  }

  async update(id, data, options = {}) {
    return this.model.findByIdAndUpdate(
      id, 
      { $set: data }, 
      { new: true, runValidators: true, ...options }
    ).lean();
  }

  async delete(id, options = {}) {
    return this.model.findByIdAndDelete(id, options).lean();
  }

  async exists(filter, options = {}) {
    return this.model.exists(filter).setOptions(options);
  }

  async count(filter = {}, options = {}) {
    return this.model.countDocuments(filter).setOptions(options);
  }

  async aggregate(pipeline, options = {}) {
    return this.model.aggregate(pipeline).session(options.session);
  }
}

module.exports = BaseRepository;
