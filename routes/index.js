const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const authControllers = require('../controllers/authControllers');
const authenController = require('../controllers/authenController');
const postulanteController = require('../controllers/postulanteController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);
    router.post('/buscador', homeController.buscador);

    // Crear Vacantes
    router.get('/vacantes/nueva',
        authenController.virificarAutentificacion,
        vacantesController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva',
        authenController.virificarAutentificacion,
        vacantesController.validarCampos,
        vacantesController.agregarVacante
    );
    router.get('/vacantes/:vacante',
        vacantesController.showVacante
    );
    router.get('/vacantes/editar/:vacante',
        authenController.virificarAutentificacion,
        vacantesController.editarVacante
    );
    router.post('/vacantes/editar/:vacante',
        authenController.virificarAutentificacion,
        vacantesController.validarCampos,
        vacantesController.UpdateVacante
    );
    router.delete('/vacantes/eliminar/:id', authenController.virificarAutentificacion, vacantesController.eliminarVacante)
    router.get('/crear-cuenta', authControllers.authCrear)
    router.post('/crear-cuenta', authControllers.validarCuenta, authControllers.crearCuenta);

    router.get('/login', authControllers.login);
    router.post('/login', authenController.authentificate);

    router.get('/admin', authenController.virificarAutentificacion, authenController.adminView);

    router.get('/editar-perfil', authenController.virificarAutentificacion, authenController.editarPerfil);
    router.post('/editar-perfil',
        authenController.virificarAutentificacion,
        // authenController.validarAdmin,
        authenController.subirFoto,
        authenController.savEditarPerfil);

    router.get('/cerrar-sesion', authenController.virificarAutentificacion, authenController.cerrarSesion);

    router.post('/postularme/:url', postulanteController.postulante, postulanteController.contactar, postulanteController.direccionar);
    router.get('/candidatos/:id', authenController.virificarAutentificacion, postulanteController.getCandidatos);

    router.get('/restablecer-password', authenController.formRestablecerPassword);
    router.post('/restablecer-password', authenController.restablecerPassword);
    router.get('/restablecer-password/:token', authenController.restablecerPasswordId);
    router.post('/restablecer-password/:token', authenController.restablecerPasswordSuccess);

    return router;
}