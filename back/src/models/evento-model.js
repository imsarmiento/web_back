const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const frecuencias = [
    "sinRepetir",
    "diraria",
    "semanal",
    "mensual",
]

const estados = [
    "aceptado",
    "rechazado",
]

const eventoSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: true,
    },
    descripcion: {
        type: String,
        trim: true,
        required: true,
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
        validate(value) {
            isValid = estados.includes(value);
            if (!isValid) {
                throw new Error("Estado invalido");
            }
        },
    },
    zonaHoraria: {
        type: String,
        trim: true,
        required: true,
    },
    reglas: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Regla",
            },
        ],
        validate(v) {
            const isValid = Array.isArray(v) && v.length > 0;
            if (!isValid) {
                throw new Error(`Debe tener al menos una regla`);
            }
        },
    },
});

module.exports = Evento;