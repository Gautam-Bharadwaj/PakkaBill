const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MessageTemplate', templateSchema);
