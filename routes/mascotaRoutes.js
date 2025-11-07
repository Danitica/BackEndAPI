/**
 * Rutas de Mascotas
 */
const express = require('express');
const router = express.Router();
const MascotaController = require('../controllers/mascotaController');
const {
  validateMascota,
  validateMascotaPartial,
  validateUserId: validateMascotaId
} = require('../middleware/validation');

// GET /mascotas
router.get('/', MascotaController.getAll);
// GET /mascotas/search?q=term
router.get('/search', MascotaController.search);
// GET /mascotas/stats
router.get('/stats', MascotaController.stats);
// GET /mascotas/:id
router.get('/:id', validateMascotaId, MascotaController.getById);
// POST /mascotas
router.post('/', validateMascota, MascotaController.create);
// PUT /mascotas/:id
router.put('/:id', validateMascotaId, validateMascota, MascotaController.update);
// PATCH /mascotas/:id
router.patch('/:id', validateMascotaId, validateMascotaPartial, MascotaController.update);
// DELETE /mascotas/:id
router.delete('/:id', validateMascotaId, MascotaController.delete);

module.exports = router;
