function ownerOnly(req, res, next) {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied: owner only' });
  }
  next();
}

function managerOnly(req, res, next) {
  if (!req.user || req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Access denied: manager only' });
  }
  next();
}

// owner OR manager can pass
function ownerOrManager(req, res, next) {
  if (!req.user || !['owner', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied: owner or manager only' });
  }
  next();
}

module.exports = { ownerOnly, managerOnly, ownerOrManager };
