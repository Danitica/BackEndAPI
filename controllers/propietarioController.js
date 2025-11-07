/**
 * Controlador de Propietarios
 */

const Propietario = require('../models/Propietario');
const { validationResult } = require('express-validator');

class PropietarioController {
    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || req.query.q;

            let result;
            if (search) {
                const owners = await Propietario.searchByName(search.trim());
                result = {
                    owners,
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: owners.length,
                        hasNextPage: false,
                        hasPrevPage: false
                    }
                };
            } else {
                result = await Propietario.paginate(page, limit);
            }

            res.status(200).json({
                success: true,
                message: 'Propietarios obtenidos correctamente',
                data: result.owners,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error en PropietarioController.getAll:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            if (isNaN(id)) {
                return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
            }
            const owner = await Propietario.findById(id);
            if (!owner) {
                return res.status(404).json({ success: false, message: 'Propietario no encontrado' });
            }
            res.status(200).json({ success: true, message: 'Propietario obtenido correctamente', data: owner });
        } catch (error) {
            console.error('Error en PropietarioController.getById:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });
            }

            const { nombre, apellido, cedula, telefono, correo } = req.body;

            // Unicidad cedula
            const existingCedula = await Propietario.findByCedula(cedula);
            if (existingCedula) {
                return res.status(409).json({ success: false, message: 'La cédula ya está registrada' });
            }
            // Unicidad correo
            const existingCorreo = await Propietario.findByCorreo(correo);
            if (existingCorreo) {
                return res.status(409).json({ success: false, message: 'El correo ya está registrado' });
            }

            const newOwner = await Propietario.create({ nombre, apellido, cedula, telefono, correo });

            res.status(201).json({ success: true, message: 'Propietario creado correctamente', data: newOwner });
        } catch (error) {
            console.error('Error en PropietarioController.create:', error);
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
            const { nombre, apellido, cedula, telefono, correo } = req.body;
            if (isNaN(id)) {
                return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
            }
            const existing = await Propietario.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Propietario no encontrado' });
            }
            if (cedula && cedula !== existing.cedula) {
                const cedulaOwner = await Propietario.findByCedula(cedula);
                if (cedulaOwner && cedulaOwner.id_propietario !== parseInt(id)) {
                    return res.status(409).json({ success: false, message: 'La cédula ya está registrada en otro propietario' });
                }
            }
            if (correo && correo !== existing.correo) {
                const correoOwner = await Propietario.findByCorreo(correo);
                if (correoOwner && correoOwner.id_propietario !== parseInt(id)) {
                    return res.status(409).json({ success: false, message: 'El correo ya está registrado en otro propietario' });
                }
            }

            const updated = await Propietario.update(id, { nombre, apellido, cedula, telefono, correo });
            res.status(200).json({ success: true, message: 'Propietario actualizado correctamente', data: updated });
        } catch (error) {
            console.error('Error en PropietarioController.update:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            if (isNaN(id)) {
                return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
            }
            const existing = await Propietario.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Propietario no encontrado' });
            }
            await Propietario.delete(id);
            res.status(200).json({ success: true, message: 'Propietario eliminado correctamente' });
        } catch (error) {
            console.error('Error en PropietarioController.delete:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async search(req, res) {
        try {
            const { q } = req.query;
            if (!q || q.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'El parámetro de búsqueda es requerido' });
            }
            const owners = await Propietario.searchByName(q.trim());
            res.status(200).json({ success: true, message: 'Búsqueda completada', data: owners, count: owners.length });
        } catch (error) {
            console.error('Error en PropietarioController.search:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }

    static async stats(req, res) {
        try {
            const total = await Propietario.count();
            res.status(200).json({ success: true, message: 'Estadísticas obtenidas correctamente', data: { totalPropietarios: total, timestamp: new Date().toISOString() } });
        } catch (error) {
            console.error('Error en PropietarioController.stats:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
        }
    }
}

module.exports = PropietarioController;
