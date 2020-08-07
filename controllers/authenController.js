const passport = require('passport');
const multer = require('multer');
const shorid = require('shortid');
const crypto = require('crypto');
const nodeMailer = require('../handlers/email');
const Vacante = require('../models/Vacantes');
const Usuario = require('../models/Usuario');

exports.authentificate = passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: 'Por favor, complete los campos'
});

exports.virificarAutentificacion = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    else res.redirect('/login');
};

exports.adminView = async (req, res) => {

    const vacante = await Vacante.find({ autor: req.user._id });

    res.render('admin', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Ajusta y Administra cada una de tus Vacantes',
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        cerrarSesion: true,
        vacante,
    });
};

exports.editarPerfil = async (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfíl',
        nombre: req.user.nombre,
        cerrarSesion: true,
        auth: req.user
    });
}

exports.savEditarPerfil = async (req, res) => {
    const auth = await Usuario.findById(req.user._id);
    const { nombre, email, password } = req.body;

    if (!nombre.length) {
        res.redirect('/editar-perfil');
        req.flash('error', 'Este campo es obligatorio');
    }
    if (!email.length) req.flash('error', 'Este campo es obligatorio');

    auth.nombre = nombre;
    auth.email = email;
    if (password.length) auth.password = password;

    if (req.file) {
        auth.imagen = req.file.filename;
    }

    await auth.save();

    req.flash('correcto', 'Combios realizados correctamente');

    res.redirect('/admin');
}

exports.cerrarSesion = (req, res) => {
    req.logout();
    res.redirect('/login');
}

exports.validarAdmin = (req, res, next) => {
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if (req.body.password) req.sanitizeBody('password').escape();

    req.checkBody('nombre', 'El campo nombre es obligatorio').notEmpty();
    req.checkBody('email', 'El campo E-Mail es obligatorio').notEmpty();

    const errores = req.validationErrors();
    if (errores) {
        req.flash('error', errores.map(error => error.msg));
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfíl',
            nombre: req.user.nombre,
            cerrarSesion: true,
            auth: req.user,
            message: req.flash()
        });
    }
    next();
}

exports.subirFoto = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                console.log(error.code)
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El tamaño ingresado excede máximo de bit');
                }
                else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/admin');
            return;
        }
        else {
            return next()
        }
    });
    next();
}

const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (res, file, cb) => {
            cb(null, __dirname + '../../public/uploads/perfiles')
        },
        filename: (req, file, cb) => {
            const extencion = file.mimetype.split('/');
            const nombreImagen = `${shorid.generate()}.${extencion[1]}`;
            cb(null, nombreImagen);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') cb(null, true);
        else cb(new Error('Formato no valido'), false);
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.formRestablecerPassword = async (req, res) => {
    res.render('form-restablcerpass', {
        nombrePagina: 'Restablece tu Password',
        tagline: '¿Olvidaste tu Password?'
    })
}

exports.restablecerPassword = async (req, res) => {
    const auth = await Usuario.findOne({ email: req.body.email });
    if (!auth) {
        req.flash('error', 'El E-Mail ingresado no existe');
        return res.redirect('/restablecer-password');
    }
    auth.token = crypto.randomBytes(15).toString('hex');
    auth.expira = Date.now() + 3600000;
    await auth.save();

    const url = `http://${req.headers.host}/restablecer-password/${auth.token}`;

    await nodeMailer.enviar({
        auth,
        subjec: 'Password Reset',
        resetUrl: url,
        archivo: 'reset'
    })

    req.flash('correcto', 'Se te ha enviado un E-Mail a tu cuenta asociada verifica tu bandeja de entrada');
    res.redirect('/login');
}

exports.restablecerPasswordId = async (req, res) => {
    const auth = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    if (!auth) {
        req.flash('error', 'Token no valido');
        return res.redirect('/login');
    }
    res.render('restablecer', {
        nombrePagina: 'Restaurar Password',
    });
}

exports.restablecerPasswordSuccess = async (req, res) => {
    const auth = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    if (!auth) {
        req.flash('error', 'Token no valido');
        return res.redirect('/login');
    }
    auth.password = req.body.password;
    auth.token = undefined;
    auth.expira = undefined;

    await auth.save();
    req.flash('correcto', 'Has restabecido tu contraseña correctamente');
    res.redirect('/login');

}
