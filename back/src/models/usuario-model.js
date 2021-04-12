const mongoose = require("mongoose");

let Schema = mongoose.Schema;

/**
 * Definición del documento que contendrá la información de un usuario
 */
const usuarioSchema = new Schema({
  nombre: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  apellido: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  contrasena: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    validate(value) {
      var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      isValid = re.test(value);
      if (!isValid) {
        throw new Error("Correo invalido");
      }
    },
  },
  eventos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
    },
  ],
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

// Arreglo de los campos que no queremos modificar
const noUpdatable = ["__v"];

/**
 * @param body: Corresponde a los campos que se van a actualizar
 * @returns retorna true si todos los campos que se actualizan se pueden,
 *  retorna false en caso contrario.
 */
Usuario.fieldsNotAllowedUpdates = (body) => {
  const updates = Object.keys(body);

  // Sirve para obtener los campos del modelo
  let allowedUpdates = Object.keys(Usuario.schema.paths);

  // Deja los campos que no queremos moficiar
  allowedUpdates = allowedUpdates.filter(
    (update) => !noUpdatable.includes(update)
  );
  const isValidOp = updates.every((update) => allowedUpdates.includes(update));
  console.log(updates);
  return isValidOp;
};

module.exports = Usuario;
