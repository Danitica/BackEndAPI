/**
 * Modelo de Mascota
 */

const { pool } = require('../config/database');

class Mascota {
    /**
     * Obtener todas las mascotas
     * @returns {Promise<Array>}
     */
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT id_mascota, nombre, edad, raza, id_propietario FROM mascotas ORDER BY id_mascota DESC'
            );
            return rows;
        } catch (error) {
            console.error('Error en Mascota.findAll:', error);
            throw new Error('Error al obtener mascotas');
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
                'SELECT id_mascota, nombre, edad, raza, id_propietario FROM mascotas WHERE id_mascota = ?',
                [id]
            );
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error('Error en Mascota.findById:', error);
            throw new Error('Error al buscar mascota por ID');
        }
    }

    /**
     * Crear mascota
     * @param {{nombre:string, edad:number, raza:string, id_propietario:number}} data
     */
    static async create(data) {
        try {
            const { nombre, edad, raza, id_propietario } = data;
            const [result] = await pool.execute(
                'INSERT INTO mascotas (nombre, edad, raza, id_propietario) VALUES (?, ?, ?, ?)',
                [nombre, edad, raza, id_propietario]
            );
            return await this.findById(result.insertId);
        } catch (error) {
            console.error('Error en Mascota.create:', error);
            throw new Error('Error al crear mascota');
        }
    }

    /**
     * Actualizar mascota
     * @param {number} id
     * @param {{nombre:string, edad:number, raza:string, id_propietario:number}} data
     */
    static async update(id, data) {
        try {
            const { nombre, edad, raza, id_propietario } = data;
            const [result] = await pool.execute(
                'UPDATE mascotas SET nombre = ?, edad = ?, raza = ?, id_propietario = ? WHERE id_mascota = ?',
                [nombre, edad, raza, id_propietario, id]
            );
            if (!result.affectedRows) return null;
            return await this.findById(id);
        } catch (error) {
            console.error('Error en Mascota.update:', error);
            throw new Error('Error al actualizar mascota');
        }
    }

    /**
     * Eliminar mascota
     * @param {number} id
     */
    static async delete(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM mascotas WHERE id_mascota = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en Mascota.delete:', error);
            throw new Error('Error al eliminar mascota');
        }
    }

    /**
     * Buscar por nombre o raza (parcial)
     * @param {string} term
     */
    static async search(term) {
        try {
            const like = `%${term}%`;
            const [rows] = await pool.execute(
                'SELECT id_mascota, nombre, edad, raza, id_propietario FROM mascotas WHERE nombre LIKE ? OR raza LIKE ? ORDER BY nombre',
                [like, like]
            );
            return rows;
        } catch (error) {
            console.error('Error en Mascota.search:', error);
            throw new Error('Error al buscar mascotas');
        }
    }

    /**
     * Contar total
     */
    static async count() {
        try {
            const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM mascotas');
            return rows[0].total;
        } catch (error) {
            console.error('Error en Mascota.count:', error);
            throw new Error('Error al contar mascotas');
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

            const [pets] = await pool.execute(
                `SELECT id_mascota, nombre, edad, raza, id_propietario FROM mascotas ORDER BY id_mascota DESC LIMIT ${limitInt} OFFSET ${offset}`
            );
            const total = await this.count();
            const totalPages = Math.ceil(total / limitInt);
            return {
                pets,
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
            console.error('Error en Mascota.paginate:', error);
            throw new Error('Error al paginar mascotas');
        }
    }
}

module.exports = Mascota;
