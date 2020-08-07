const Usuario = require('../models/Usuario');

exports.authCrear = (req, res) => {
    res.render('crear-pagina', {
        nombrePagina: 'Inicia ya en Jalliday',
        tagline: 'Solo crea una cuenta y comienza a publicar tus vacantes'
    });
}

exports.crearCuenta = async (req, res, next) => {
    const auth = new Usuario(req.body);
    try {
        await auth.save();
        res.redirect('/login');
    } catch (error) {
        console.log(error)
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }

}

exports.validarCuenta = (req, res, next) => {
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
    req.checkBody('email', 'El email es obligatorio').notEmpty();
    req.checkBody('password', 'El password es obligatorio').notEmpty();
    req.checkBody('confirmar', 'Confirmar password es obligatorio').notEmpty();

    req.checkBody('email', 'No cumple con los requisitos de un email').isEmail();

    req.checkBody('password', 'Los password ingresados no coinciden').equals(req.body.confirmar);
    const errores = req.validationErrors();
    if (errores) {
        req.flash('error', errores.map(error => error.msg));
        res.render('crear-pagina', {
            nombrePagina: 'Inicia ya en Jalliday',
            tagline: 'Solo crea una cuenta y comienza a publicar tus vacantes',
            message: req.flash(),
        });
        return null;
    }
    next();
    return;
}

exports.login = (req, res) => {
    res.render('login', {
        nombrePagina: 'Iniciar Sesión',
    });
}