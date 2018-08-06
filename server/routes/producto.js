const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();
const _ = require('underscore');
const Producto = require('../models/producto');
const Usuario = require('../models/usuario');

// ================================
// Mostrar todos los productos
// ================================
app.get('/producto', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(desde)
        .limit(limite)
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({ ok: false, err });
            }

            Producto.countDocuments(null, (err, cont) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: cont
                });
            })
        });
});

// ================================
// Mostrar un producto por ID
// ================================
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({ ok: false, err });
            }
            if (!productoDB) {
                return res.status(404).json({ ok: false, err: { message: 'Producto no encontrado' } });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });

});

// ================================
// Buscar producto segun un texto
// ================================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        });
});

// ================================
// Crear nuevo producto
// ================================
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id,
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});

// ================================
// Actualiza un producto
// ================================
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ================================
// Elimina un producto
// ================================
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let cambiaDisponibilidad = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaDisponibilidad, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Ese producto no existe'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto no disponible'
        });
    });
});

module.exports = app;