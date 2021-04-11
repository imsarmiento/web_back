const mongoose = require("mongoose");

let Schema = mongoose.Schema;

/**
 * Definición del documento que contendrá la información de un grupo
 */
const grupoSchema = new Schema({
  nombre: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  administradores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  ],
  integrantes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  ],
  eventos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
    },
  ],
});

const Grupo = mongoose.model("Grupo", grupoSchema);

// Arreglo de los campos que no queremos modificar
const noUpdatable = ["__v"];

/**
 * @param body: Corresponde a los campos que se van a actualizar
 * @returns retorna true si todos los campos que se actualizan se pueden,
 *  retorna false en caso contrario.
 */
Grupo.fieldsNotAllowedUpdates = (body) => {
  const updates = Object.keys(body);

  // Sirve para obtener los campos del modelo
  let allowedUpdates = Object.keys(Grupo.schema.paths);

  // Deja los campos que no queremos moficiar
  allowedUpdates = allowedUpdates.filter(
    (update) => !noUpdatable.includes(update)
  );
  const isValidOp = updates.every((update) => allowedUpdates.includes(update));
  console.log(updates);
  return isValidOp;
};

module.exports = Grupo;
