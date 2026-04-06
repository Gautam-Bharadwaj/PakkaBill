/**
 * PATTERN: Repository
 * Abstract base repository providing CRUD + pagination for all models.
 * All domain repositories extend this class.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, populate = '') {
    return this.model.findById(id).populate(populate).lean();
  }

  async findOne(filter, populate = '') {
    return this.model.findOne(filter).populate(populate).lean();
  }

  async findAll(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      populate = '',
      select = '',
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
        .lean(),
      this.model.countDocuments(filter),
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

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    return this.model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id).lean();
  }

  async exists(filter) {
    return this.model.exists(filter);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;
