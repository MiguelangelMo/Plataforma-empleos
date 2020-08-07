const mongoose = require('mongoose');
const Vacante = require('../models/Vacantes');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        cerrarSesion: true,
    })
}

exports.validarCampos = (req, res, next) => {
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    req.checkBody('titulo', 'El campo título es obligatorio').notEmpty();
    req.checkBody('empresa', 'El campo empresa es obligatorio').notEmpty();
    req.checkBody('ubicacion', 'El campo ubicacion es obligatorio').notEmpty();
    req.checkBody('contrato', 'El campo contrato es obligatorio').notEmpty();
    req.checkBody('skills', 'El campo skills es obligatorio').notEmpty();

    const errores = req.validationErrors();
    if (errores) {
        req.flash('error', errores.map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            nombre: req.user.nombre,
            cerrarSesion: true,
            message: req.flash()
        });
    }
    next()
}

exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);
    vacante.autor = req.user._id
    vacante.skills = req.body.skills.split(',');
    await vacante.save();
    res.redirect(`/vacantes/${vacante.url}`);
}

exports.showVacante = async (req, res, next) => {

    const vacante = await Vacante.findOne({ url: req.params.vacante }).populate('autor');

    if (!vacante) return next();
    res.render('showVacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    });
}

exports.editarVacante = async (req, res) => {
    const vacante = await Vacante.findOne({ url: req.params.vacante });
    res.render('editarVacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        cerrarSesion: true,
    });
}

exports.UpdateVacante = async (req, res, next) => {
    try {
        const vacanteActilizada = req.body
        vacanteActilizada.skills = req.body.skills.split(',');

        const vacante = await Vacante.findOneAndUpdate({ url: req.params.vacante }, vacanteActilizada, { new: true, runValidators: true });
        res.redirect(`/vacantes/${vacante.url}`)
    } catch (error) {
        console.log(error)
    }
}

exports.eliminarVacante = async (req, res) => {
    const vacante = await Vacante.findById(req.params.id);
    if (identificarAutor(vacante, req.user)) {
        vacante.remove();
        res.send('Vacante eliminada correctamente');
    }
    else res.status(403).send('Operación no permitida');
}

const identificarAutor =  (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) return false;
    else return true;
}