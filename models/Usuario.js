const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Usuario = new mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        require: "Nombre requerido",
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        require: "E-Mail requerido",
        lowercase: true
    },
    password: {
        type: String,
        trim: true,
        require: true,
    },
    imagen:{
        type: String,
        trim: true,
    },
    token: {
        type: String,
        trim: true,
    },
    expira: {
        type: Date,
    }
});

Usuario.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    const bcryPass = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
    this.password = bcryPass;
    next();
});

Usuario.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next('El correo ingresado ya se encuentra registrado');
    } else next(error);
});

Usuario.methods = {
    compararPass: function (password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuario', Usuario);