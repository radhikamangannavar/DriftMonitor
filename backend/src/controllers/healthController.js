const getHealth = (req, res) => {
  res.json({
    success: true,
    status: "ok",
  });
};

module.exports = {
  getHealth,
};