'use strict';

const requireRole = require('./requireRole');

// requireAdmin adalah requireRole('admin'): verifikasi JWT lalu pastikan role admin.
const requireAdmin = requireRole('admin');

module.exports = requireAdmin;
