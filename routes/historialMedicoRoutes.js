/**
 * Rutas de Historial Médico
 */
const express = require('express');
const router = express.Router();
const HistorialMedicoController = require('../controllers/historialMedicoController');
const {
    validateHistorialMedico,
    validateHistorialMedicoPartial,
    validateUserId: validateHistorialId
} = require('../middleware/validation');

// GET /historial-medico
router.get('/', HistorialMedicoController.getAll);
// GET /historial-medico/search?q=term
router.get('/search', HistorialMedicoController.search);
// GET /historial-medico/stats
router.get('/stats', HistorialMedicoController.stats);
// GET /historial-medico/mascota/:idMascota
router.get('/mascota/:idMascota', HistorialMedicoController.getByMascota);
// GET /historial-medico/:id
router.get('/:id', validateHistorialId, HistorialMedicoController.getById);
// POST /historial-medico
router.post('/', validateHistorialMedico, HistorialMedicoController.create);
// PUT /historial-medico/:id
router.put('/:id', validateHistorialId, validateHistorialMedico, HistorialMedicoController.update);
// PATCH /historial-medico/:id
router.patch('/:id', validateHistorialId, validateHistorialMedicoPartial, HistorialMedicoController.update);
// DELETE /historial-medico/:id
router.delete('/:id', validateHistorialId, HistorialMedicoController.delete);

module.exports = router;
