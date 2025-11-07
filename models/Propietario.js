/**
 * Modelo de Propietario
 * @description Operaciones CRUD para la entidad Propietario
 */

const { pool } = require('../config/database');

class Propietario {
    /**
     * Obtiene todos los propietarios
     * @returns {Promise<Array>}
     */
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT id_propietario, nombre, apellido, cedula, telefono, correo FROM propietarios ORDER BY id_propietario DESC'
            );
            return rows;
        } catch (error) {
            console.error('Error en Propietario.findAll:', error);
            throw new Error('Error al obtener propietarios');
        }
    }

    /**
     * Busca un propietario por su ID
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT id_propietario, nombre, apellido, cedula, telefono, correo FROM propietarios WHERE id_propietario = ?',[id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error en Propietario.findById:', error);
            throw new Error('Error al buscar propietario por ID');
        }
    }

    /**
     * Busca un propietario por su cédula
     * @param {string} cedula
     * @returns {Promise<Object|null>}
     */
    static async findByCedula(cedula) {
        try {
            const [rows] = await pool.execute(
                'SELECT id_propietario, nombre, apellido, cedula, telefono, correo FROM propietarios WHERE cedula = ?', [cedula]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error en Propietario.findByCedula:', error);
            throw new Error('Error al buscar propietario por cédula');
        }
    }

    /**
     * Busca un propietario por su correo
     * @param {string} correo
     * @returns {Promise<Object|null>}
     */
    static async findByCorreo(correo) {
        try {
            const [rows] = await pool.execute(
                'SELECT id_propietario, nombre, apellido, cedula, telefono, correo FROM propietarios WHERE correo = ?', [correo]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error en Propietario.findByCorreo:', error);
            throw new Error('Error al buscar propietario por correo');
        }
    }

    /**
     * Crea un nuevo propietario
     * @param {{nombre:string, apellido:string, cedula:string, telefono:string, correo:string}} data
     * @returns {Promise<Object>}
     */
    static async create(data) {
        try {
            const { nombre, apellido, cedula, telefono, correo } = data;

            const [result] = await pool.execute(
                'INSERT INTO propietarios (nombre, apellido, cedula, telefono, correo) VALUES (?, ?, ?, ?, ?)',
                [nombre, apellido, cedula, telefono, correo]
            );

            return await this.findById(result.insertId);
        } catch (error) {
            console.error('Error en Propietario.create:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                // Mensaje genérico por si hay índice único en cedula/correo
                throw new Error('La cédula o el correo ya está registrado');
            }
            throw new Error('Error al crear propietario');
        }
    }

    /**
     * Actualiza un propietario
     * @param {number} id
     * @param {{nombre?:string, apellido?:string, cedula?:string, telefono?:string, correo?:string}} data
     * @returns {Promise<Object|null>}
     */
    static async update(id, data) {
        try {
            const { nombre, apellido, cedula, telefono, correo } = data;

            const [result] = await pool.execute(
                'UPDATE propietarios SET nombre = ?, apellido = ?, cedula = ?, telefono = ?, correo = ? WHERE id_propietario = ?',
                [nombre, apellido, cedula, telefono, correo, id]
            );

            if (result.affectedRows === 0) return null;
            return await this.findById(id);
        } catch (error) {
            console.error('Error en Propietario.update:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('La cédula o el correo ya está registrado');
            }
            throw new Error('Error al actualizar propietario');
        }
    }

    /**
     * Elimina un propietario
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM propietarios WHERE id_propietario = ?', [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en Propietario.delete:', error);
            throw new Error('Error al eliminar propietario');
        }
    }

    /**
     * Búsqueda por nombre o apellido (parcial)
     * @param {string} term
     * @returns {Promise<Array>}
     */
    static async searchByName(term) {
        try {
            const like = `%${term}%`;
            const [rows] = await pool.execute(
                'SELECT id_propietario, nombre, apellido, cedula, telefono, correo FROM propietarios WHERE nombre LIKE ? OR apellido LIKE ? ORDER BY nombre, apellido',
                [like, like]
            );
            return rows;
        } catch (error) {
            console.error('Error en Propietario.searchByName:', error);
            throw new Error('Error al buscar propietarios');
        }
    }

    /**
     * Cuenta total de propietarios
     * @returns {Promise<number>}
     */
    static async count() {
        try {
            const [rows] = await pool.execute('SELECT COUNT(*) as total FROM propietarios');
            return rows[0].total;
        } catch (error) {
            console.error('Error en Propietario.count:', error);
            throw new Error('Error al contar propietarios');
        }
    }

    /**
     * Paginación de propietarios
     * @param {number} page
     * @param {number} limit
     * @returns {Promise<{owners:Array, pagination:Object}>}
     */
    static async paginate(page = 1, limit = 10) {
        try {
            let pageInt = parseInt(page) || 1;
            let limitInt = parseInt(limit) || 10;
            if (pageInt < 1) pageInt = 1;
            if (limitInt < 1) limitInt = 10;
            if (limitInt > 100) limitInt = 100;
            const offset = (pageInt - 1) * limitInt;

            const [owners] = await pool.execute(
                `SELECT id_propietario, nombre, apellido, cedula, telefono, correo FROM propietarios ORDER BY id_propietario DESC LIMIT ${limitInt} OFFSET ${offset}`
            );

            const total = await this.count();
            const totalPages = Math.ceil(total / limitInt);

            return {
                owners,
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
            console.error('Error en Propietario.paginate:', error);
            throw new Error('Error al paginar propietarios');
        }
    }
}

module.exports = Propietario;
