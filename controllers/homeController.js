const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find();

    if (!vacantes) return next();

    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y Pública Trabajos para Desarrolladores Web',
        barra: true,
        boton: true,
        vacantes
    })
}

exports.buscador = async (req, res) => {
    console.log(req.body)
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    });

    
    console.log(vacantes)

    if (!vacantes) {
        req.flash('error', 'No se encuentra resultados');
        return res.redirect('/', {
            barra: true,
            boton: true,
        });
    }

    res.render('home', {
        nombrePagina: `Resultados de ${req.body.q}`,
        barra: true,
        boton: true,
        vacantes
    });
}