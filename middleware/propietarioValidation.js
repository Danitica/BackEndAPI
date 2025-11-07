/**
 * Validaciones para Propietarios
 */

const { body, param, query } = require('express-validator');

const nombreApellidoRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;

// Crear / Actualizar completo
const validatePropietario = [
    body('nombre')
        .trim().notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(nombreApellidoRegex).withMessage('El nombre solo puede contener letras y espacios'),

    body('apellido')
        .trim().notEmpty().withMessage('El apellido es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
        .matches(nombreApellidoRegex).withMessage('El apellido solo puede contener letras y espacios'),

    body('cedula')
        .trim().notEmpty().withMessage('La cédula es requerida')
        .isLength({ min: 5, max: 20 }).withMessage('La cédula debe tener entre 5 y 20 caracteres')
        .matches(/^[0-9\-\.]+$/).withMessage('La cédula solo puede contener dígitos, puntos o guiones'),

    body('telefono')
        .trim().notEmpty().withMessage('El teléfono es requerido')
        .matches(/^[\+]?[-0-9()\s]{7,20}$/).withMessage('Formato de teléfono inválido'),

    body('correo')
        .trim().notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('Debe ser un correo válido')
        .isLength({ max: 100 }).withMessage('El correo no puede exceder 100 caracteres')
        .normalizeEmail()
];

// Parcial (PATCH)
const validatePropietarioPartial = [
    body('nombre')
        .optional().trim()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(nombreApellidoRegex).withMessage('El nombre solo puede contener letras y espacios'),
    body('apellido')
        .optional().trim()
        .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
        .matches(nombreApellidoRegex).withMessage('El apellido solo puede contener letras y espacios'),
    body('cedula')
        .optional().trim()
        .isLength({ min: 5, max: 20 }).withMessage('La cédula debe tener entre 5 y 20 caracteres')
        .matches(/^[0-9\-\.]+$/).withMessage('La cédula solo puede contener dígitos, puntos o guiones'),
    body('telefono')
        .optional().trim()
        .matches(/^[\+]?[-0-9()\s]{7,20}$/).withMessage('Formato de teléfono inválido'),
    body('correo')
        .optional().trim()
        .isEmail().withMessage('Debe ser un correo válido')
        .isLength({ max: 100 }).withMessage('El correo no puede exceder 100 caracteres')
        .normalizeEmail()
];

const validatePropietarioId = [
    param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const validatePagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100')
];

const validateSearch = [
    query('q').trim().isLength({ min: 1, max: 100 }).withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
];

module.exports = {
    validatePropietario,
    validatePropietarioPartial,
    validatePropietarioId,
    validatePagination,
    validateSearch
};
