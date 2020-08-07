const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../models/Usuario');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, async (email, password, done) => {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return done(null, false, {
        message: "Usuario no existente, intente de nuevo"
    });
    const verificar = usuario.compararPass(password);
    if (!verificar) return done(null, false, {
        message: 'Password incorrecto',
    });
    return done(null, usuario);
}));

passport.serializeUser((usuario, done) => { done(null, usuario._id) })

passport.deserializeUser(async (id, done) => {
    const usuario = await Usuario.findById(id).exec();
    return done(null, usuario);
});

module.exports = passport;