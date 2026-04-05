function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function json(res, data, status = 200) {
  return res.status(status).json(data);
}

module.exports = { success, json };
