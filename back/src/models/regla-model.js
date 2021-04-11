const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const regglaSchema = new Schema({
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

module.exports = Regla;