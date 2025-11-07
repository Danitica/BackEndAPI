/**
 * Controlador de Mascotas
 */

const Mascota = require('../models/Mascota');
const Propietario = require('../models/Propietario');
const { validationResult } = require('express-validator');

class MascotaController {
    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || req.query.q;

            let result;
            if (search) {
                const pets = await Mascota.search(search.trim());
                result = {
                    pets,
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: pets.length,
                        hasNextPage: false,
                        hasPrevPage: false
                    }
                };
            } else {
                result = await Mascota.paginate(page, limit);
            }

            res.status(200).json({ success: true, message: 'Mascotas obtenidas correctamente', data: result.pets, pagination: result.pagination });
        } catch (error) {
            console.error('Error en MascotaController.getAll:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            if (isNaN(id)) return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
            const pet = await Mascota.findById(id);
            if (!pet) return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
            res.status(200).json({ success: true, message: 'Mascota obtenida correctamente', data: pet });
        } catch (error) {
            console.error('Error en MascotaController.getById:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });
            }
            const { nombre, edad, raza, id_propietario } = req.body;

            // Verificar propietario
            const owner = await Propietario.findById(id_propietario);
            if (!owner) {
                return res.status(404).json({ success: false, message: 'Propietario no encontrado para asociar la mascota' });
            }

            const newPet = await Mascota.create({ nombre, edad, raza, id_propietario });
            res.status(201).json({ success: true, message: 'Mascota creada correctamente', data: newPet });
        } catch (error) {
            console.error('Error en MascotaController.create:', error);
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
            const { nombre, edad, raza, id_propietario } = req.body;
            if (isNaN(id)) return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });

            const existing = await Mascota.findById(id);
            if (!existing) return res.status(404).json({ success: false, message: 'Mascota no encontrada' });

            if (id_propietario) {
                const owner = await Propietario.findById(id_propietario);
                if (!owner) {
                    return res.status(404).json({ success: false, message: 'Propietario no encontrado para asociar la mascota' });
                }
            }

            const updated = await Mascota.update(id, { nombre, edad, raza, id_propietario });
            res.status(200).json({ success: true, message: 'Mascota actualizada correctamente', data: updated });
        } catch (error) {
            console.error('Error en MascotaController.update:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            if (isNaN(id)) return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });

            const existing = await Mascota.findById(id);
            if (!existing) return res.status(404).json({ success: false, message: 'Mascota no encontrada' });

            await Mascota.delete(id);
            res.status(200).json({ success: true, message: 'Mascota eliminada correctamente' });
        } catch (error) {
            console.error('Error en MascotaController.delete:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async search(req, res) {
        try {
            const { q } = req.query;
            if (!q || q.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'El parámetro de búsqueda es requerido' });
            }
            const pets = await Mascota.search(q.trim());
            res.status(200).json({ success: true, message: 'Búsqueda completada', data: pets, count: pets.length });
        } catch (error) {
            console.error('Error en MascotaController.search:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async stats(req, res) {
        try {
            const total = await Mascota.count();
            res.status(200).json({ success: true, message: 'Estadísticas obtenidas correctamente', data: { totalMascotas: total, timestamp: new Date().toISOString() } });
        } catch (error) {
            console.error('Error en MascotaController.stats:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }
}

module.exports = MascotaController;
