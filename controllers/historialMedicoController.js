/**
 * Controlador de Historial Médico
 */

const HistorialMedico = require('../models/HistorialMedico');
const Mascota = require('../models/Mascota');
const { validationResult } = require('express-validator');

class HistorialMedicoController {
    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || req.query.q;

            let result;
            if (search) {
                const records = await HistorialMedico.search(search.trim());
                result = {
                    records,
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: records.length,
                        hasNextPage: false,
                        hasPrevPage: false
                    }
                };
            } else {
                result = await HistorialMedico.paginate(page, limit);
            }

            res.status(200).json({ 
                success: true, 
                message: 'Historiales médicos obtenidos correctamente', 
                data: result.records, 
                pagination: result.pagination 
            });
        } catch (error) {
            console.error('Error en HistorialMedicoController.getAll:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            if (isNaN(id)) return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
            
            const record = await HistorialMedico.findById(id);
            if (!record) return res.status(404).json({ success: false, message: 'Historial médico no encontrado' });
            
            res.status(200).json({ success: true, message: 'Historial médico obtenido correctamente', data: record });
        } catch (error) {
            console.error('Error en HistorialMedicoController.getById:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async getByMascota(req, res) {
        try {
            const { idMascota } = req.params;
            if (isNaN(idMascota)) {
                return res.status(400).json({ success: false, message: 'El ID de mascota debe ser un número válido' });
            }

            const mascota = await Mascota.findById(idMascota);
            if (!mascota) {
                return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
            }

            const records = await HistorialMedico.findByMascota(idMascota);
            res.status(200).json({ 
                success: true, 
                message: 'Historiales de la mascota obtenidos correctamente', 
                data: records,
                count: records.length 
            });
        } catch (error) {
            console.error('Error en HistorialMedicoController.getByMascota:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });
            }

            const { diagnostico, motivo_consulta, fecha, id_mascota } = req.body;

            // Verificar mascota
            const mascota = await Mascota.findById(id_mascota);
            if (!mascota) {
                return res.status(404).json({ success: false, message: 'Mascota no encontrada para asociar el historial' });
            }

            const newRecord = await HistorialMedico.create({ diagnostico, motivo_consulta, fecha, id_mascota });
            res.status(201).json({ success: true, message: 'Historial médico creado correctamente', data: newRecord });
        } catch (error) {
            console.error('Error en HistorialMedicoController.create:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });
            }

            const { id } = req.params;
            const { diagnostico, motivo_consulta, fecha, id_mascota } = req.body;
            if (isNaN(id)) return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });

            const existing = await HistorialMedico.findById(id);
            if (!existing) return res.status(404).json({ success: false, message: 'Historial médico no encontrado' });

            if (id_mascota) {
                const mascota = await Mascota.findById(id_mascota);
                if (!mascota) {
                    return res.status(404).json({ success: false, message: 'Mascota no encontrada para asociar el historial' });
                }
            }

            const updated = await HistorialMedico.update(id, { diagnostico, motivo_consulta, fecha, id_mascota });
            res.status(200).json({ success: true, message: 'Historial médico actualizado correctamente', data: updated });
        } catch (error) {
            console.error('Error en HistorialMedicoController.update:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            if (isNaN(id)) return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });

            const existing = await HistorialMedico.findById(id);
            if (!existing) return res.status(404).json({ success: false, message: 'Historial médico no encontrado' });

            await HistorialMedico.delete(id);
            res.status(200).json({ success: true, message: 'Historial médico eliminado correctamente' });
        } catch (error) {
            console.error('Error en HistorialMedicoController.delete:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async search(req, res) {
        try {
            const { q } = req.query;
            if (!q || q.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'El parámetro de búsqueda es requerido' });
            }
            const records = await HistorialMedico.search(q.trim());
            res.status(200).json({ success: true, message: 'Búsqueda completada', data: records, count: records.length });
        } catch (error) {
            console.error('Error en HistorialMedicoController.search:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async stats(req, res) {
        try {
            const total = await HistorialMedico.count();
            res.status(200).json({ 
                success: true, 
                message: 'Estadísticas obtenidas correctamente', 
                data: { totalHistoriales: total, timestamp: new Date().toISOString() } 
            });
        } catch (error) {
            console.error('Error en HistorialMedicoController.stats:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }
}

module.exports = HistorialMedicoController;
