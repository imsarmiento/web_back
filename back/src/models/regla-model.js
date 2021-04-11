const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const reglaSchema = new Schema({
    unidad: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
    },
    horaInicio: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    horaFin: {
        type: Date,
        required: true,
        default: Date.now(),
    },
});

const Regla = mongoose.model("Regla", reglaSchema);

module.exports = Regla;