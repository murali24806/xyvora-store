// Protects admin-only routes (login requirement disabled)
const protectAdmin = (req, res, next) => {
  req.admin = { role: 'admin' };
  next();
};

module.exports = { protectAdmin };