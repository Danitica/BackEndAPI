/**
 * Modelo de Historial Médico
 */

const { pool } = require('../config/database');

class HistorialMedico {
    /**
     * Obtener todos los historiales
     * @returns {Promise<Array>}
     */
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT id_historial, diagnostico, motivo_consulta, fecha, id_mascota FROM historial_medico ORDER BY fecha DESC'
            );
            return rows;
        } catch (error) {
            console.error('Error en HistorialMedico.findAll:', error);
            throw new Error('Error al obtener historiales médicos');
        }
    }

    /**
     * Buscar por ID
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT id_historial, diagnostico, motivo_consulta, fecha, id_mascota FROM historial_medico WHERE id_historial = ?',
                [id]
            );
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error('Error en HistorialMedico.findById:', error);
            throw new Error('Error al buscar historial médico por ID');
        }
    }

    /**
     * Buscar historiales por mascota
     * @param {number} idMascota
     * @returns {Promise<Array>}
     */
    static async findByMascota(idMascota) {
        try {
            const [rows] = await pool.execute(
                'SELECT id_historial, diagnostico, motivo_consulta, fecha, id_mascota FROM historial_medico WHERE id_mascota = ? ORDER BY fecha DESC',
                [idMascota]
            );
            return rows;
        } catch (error) {
            console.error('Error en HistorialMedico.findByMascota:', error);
            throw new Error('Error al buscar historiales por mascota');
        }
    }

    /**
     * Crear historial médico
     * @param {{diagnostico:string, motivo_consulta:string, fecha:string, id_mascota:number}} data
     */
    static async create(data) {
        try {
            const { diagnostico, motivo_consulta, fecha, id_mascota } = data;
            const [result] = await pool.execute(
                'INSERT INTO historial_medico (diagnostico, motivo_consulta, fecha, id_mascota) VALUES (?, ?, ?, ?)',
                [diagnostico, motivo_consulta, fecha, id_mascota]
            );
            return await this.findById(result.insertId);
        } catch (error) {
            console.error('Error en HistorialMedico.create:', error);
            throw new Error('Error al crear historial médico');
        }
    }

    /**
     * Actualizar historial médico
     * @param {number} id
     * @param {{diagnostico:string, motivo_consulta:string, fecha:string, id_mascota:number}} data
     */
    static async update(id, data) {
        try {
            const { diagnostico, motivo_consulta, fecha, id_mascota } = data;
            const [result] = await pool.execute(
                'UPDATE historial_medico SET diagnostico = ?, motivo_consulta = ?, fecha = ?, id_mascota = ? WHERE id_historial = ?',
                [diagnostico, motivo_consulta, fecha, id_mascota, id]
            );
            if (!result.affectedRows) return null;
            return await this.findById(id);
        } catch (error) {
            console.error('Error en HistorialMedico.update:', error);
            throw new Error('Error al actualizar historial médico');
        }
    }

    /**
     * Eliminar historial médico
     * @param {number} id
     */
    static async delete(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM historial_medico WHERE id_historial = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en HistorialMedico.delete:', error);
            throw new Error('Error al eliminar historial médico');
        }
    }

    /**
     * Buscar por diagnóstico o motivo (parcial)
     * @param {string} term
     */
    static async search(term) {
        try {
            const like = `%${term}%`;
            const [rows] = await pool.execute(
                'SELECT id_historial, diagnostico, motivo_consulta, fecha, id_mascota FROM historial_medico WHERE diagnostico LIKE ? OR motivo_consulta LIKE ? ORDER BY fecha DESC',
                [like, like]
            );
            return rows;
        } catch (error) {
            console.error('Error en HistorialMedico.search:', error);
            throw new Error('Error al buscar historiales médicos');
        }
    }

    /**
     * Contar total
     */
    static async count() {
        try {
            const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM historial_medico');
            return rows[0].total;
        } catch (error) {
            console.error('Error en HistorialMedico.count:', error);
            throw new Error('Error al contar historiales médicos');
        }
    }

    /**
     * Paginación
     */
    static async paginate(page = 1, limit = 10) {
        try {
            let pageInt = parseInt(page) || 1;
            let limitInt = parseInt(limit) || 10;
            if (pageInt < 1) pageInt = 1;
            if (limitInt < 1) limitInt = 10;
            if (limitInt > 100) limitInt = 100;
            const offset = (pageInt - 1) * limitInt;

            const [records] = await pool.execute(
                `SELECT id_historial, diagnostico, motivo_consulta, fecha, id_mascota FROM historial_medico ORDER BY fecha DESC LIMIT ${limitInt} OFFSET ${offset}`
            );
            const total = await this.count();
            const totalPages = Math.ceil(total / limitInt);
            return {
                records,
                pagination: {
                    currentPage: pageInt,
                    totalPages,
                    totalItems: total,
                    hasNextPage: pageInt < totalPages,
                    hasPrevPage: pageInt > 1,
                    limit: limitInt
                }
            };
        } catch (error) {
            console.error('Error en HistorialMedico.paginate:', error);
            throw new Error('Error al paginar historiales médicos');
        }
    }
}

module.exports = HistorialMedico;
