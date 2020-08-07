const multer = require('multer');
const shortid = require('shortid');
const Vacante = require('../models/Vacantes');

exports.direccionar = (req, res) => {
    req.flash('correcto', 'Te has postulado, mucha suerte!');
    res.redirect('/');
}

exports.contactar = async (req, res, next) => {
    
    const vacante = await Vacante.findOne({ url: req.params.url });
    if (!vacante) return next();

    const { nombre, email, tel } = req.body;

    const candidato = {
        nombre,
        email,
        tel,
        cv: req.file ? req.file.filename : null
    };
    if (nombre) candidato.nombre = nombre;
    if (email) candidato.email = email;
    if (tel) candidato.telelefono = tel;
    if (req.file) candidato.cv = req.file.filename;
    
    vacante.candidatos.push(candidato);
    await vacante.save();
}

exports.postulante = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El tamaño ingresado excede máximo de bit');
                }
                else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.status(400).redirect('/admin');
            return;
        }
        else {
            return next()
        }
    });
    next();
}

const configuracionMulter = {
    limits: { fileSize: 1000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            const url = __dirname + '../../public/uploads/cv';
            cb(null, url);
        },
        filename: (req, file, cb) => {
            const extencion = file.mimetype.split('/')[1];
            const nombre = `${shortid.generate()}.${extencion}`;
            cb(null, nombre);
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'application/pdf') cb(null, true);
            else cb(new Error('Formato no valido'), false);
        },
    })
}

const upload = multer(configuracionMulter).single('file');

exports.getCandidatos = async (req, res, next) => {
    const vacantes = await Vacante.findById(req.params.id);
    if (vacantes.autor != req.user._id.toString()) return next();
    if (!vacantes) return next();
    res.render('candidatos', {
        nombrePagina: `Candidato vacante - ${vacantes.titulo}`,
        cerrarSesion: true,
        imagen: req.user.imagen,
        nombre: req.user.nombre,
        candidatos: vacantes.candidatos
    });
}
