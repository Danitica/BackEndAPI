/**
 * Rutas de Propietarios
 */
const express = require('express');
const router = express.Router();
const PropietarioController = require('../controllers/propietarioController');
const { 
    validatePropietario, 
    validateUserId: validatePropietarioId,
    validatePropietarioPartial 
} = require('../middleware/validation');

// GET /propietarios
router.get('/', PropietarioController.getAll);
// GET /propietarios/search?q=term
router.get('/search', PropietarioController.search);
// GET /propietarios/stats
router.get('/stats', PropietarioController.stats);
// GET /propietarios/:id
router.get('/:id', validatePropietarioId, PropietarioController.getById);
// POST /propietarios
router.post('/', validatePropietario, PropietarioController.create);
// PUT /propietarios/:id
router.put('/:id', validatePropietarioId, validatePropietario, PropietarioController.update);
// PATCH /propietarios/:id (actualización parcial)
router.patch('/:id', validatePropietarioId, validatePropietarioPartial, PropietarioController.update);
// DELETE /propietarios/:id
router.delete('/:id', validatePropietarioId, PropietarioController.delete);

module.exports = router;
