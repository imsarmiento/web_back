const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const frecuencias = [
    "sinRepetir",
    "semanal",
    "mensual",
]

const estados = [
    "aceptado",
    "pendiente",
]

const eventoSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
    },
    descripcion: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
    },
    diaInicio: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    diaFin: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    fechaCreacion: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    frecuencia: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            isValid = frecuencias.includes(value);
            if (!isValid) {
                throw new Error("Frecuencia invalida");
            }
        },
    },
    estado: {
        type: String,
        trim: true,
        required: true,
        default: "pendiente",
        validate(value) {
            isValid = estados.includes(value);
            if (!isValid) {
                throw new Error("Estado invalido");
            }
        },
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
    },
    zonaHoraria: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
    },
    reglas: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Regla",
            },
        ],
    },
});

const Evento = mongoose.model("Evento", eventoSchema);

module.exports = Evento;
