const mongoose = require("mongoose");

let Schema = mongoose.Schema;

/**
 * Tipos de documentos de identificación permitidos para un empleado
 */
const tiposDocumentos = [
  "cc",
  "ti",
  "pasaporte",
  "cédula de extrangería",
  "nit",
];

/**
 * Roles que puede tener un empleado
 */
const roles = ["conductor", "asesor", "jefe"];

/**
 * Definición del documento que contendrá la información de un empleado
 */
const empleadoSchema = new Schema({
  nombres: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  apellidos: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  tipoDocumento: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    validate(value) {
      isValid = tiposDocumentos.includes(value);
      if (!isValid) {
        throw new Error("Tipo de documento invalido");
      }
    },
  },
  numeroDocumento: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  direccion: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  municipio: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  departamento: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  pais: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  telefono: {
    type: Number,
    trim: true,
    required: true,
    lowercase: true,
  },
  celular: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  rol: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    validate(value) {
      isValid = roles.includes(value);
      if (!isValid) {
        throw new Error("Rol invalido");
      }
    },
  },
});

const Empleado = mongoose.model("Empleado", empleadoSchema);

// Arreglo de los campos que no queremos modificar
const noUpdatable = ["__v"];

/**
 * @param body: Corresponde a los campos que se van a actualizar
 * @returns retorna true si todos los campos que se actualizan se pueden,
 *  retorna false en caso contrario.
 */
Empleado.fieldsNotAllowedUpdates = (body) => {
  const updates = Object.keys(body);

  // Sirve para obtener los campos del modelo
  let allowedUpdates = Object.keys(Empleado.schema.paths);

  // Deja los campos que no queremos moficiar
  allowedUpdates = allowedUpdates.filter(
    (update) => !noUpdatable.includes(update)
  );
  const isValidOp = updates.every((update) => allowedUpdates.includes(update));
  console.log(updates);
  return isValidOp;
};

module.exports = Empleado;
