const express = require("express");
const Grupo = require("../models/grupo-model");
const Usuario = require("../models/usuario-model");
const Evento = require("../models/evento-model");
const router = new express.Router();

/**
 * GRUPO
 */

/**
 * Crea un grupo
 */
router.post("/", async (req, resp) => {
  try {
    const grupo = new Grupo(req.body);
    await grupo.save();
    return resp.status(201).send(grupo);
  } catch (error) {
    console.log(error);
    resp.status(400).send(error);
  }
});

/**
 *  Devuelve todos los usuarios
 */
router.get("/", async (req, res) => {
  try {
    const usuarios = await Grupo.find({});
    return res.send(usuarios);
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * Devuelve el grupo con el id especificado
 */
router.get("/:id", async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id);
    if (!grupo) {
      return res.status(404).send("No existe un grupo con el id especificado");
    }
    return res.status(200).send(grupo);
  } catch (error) {
    res.status(500).send();
  }
});

/**
 * Devuelve el grupo con el id especificado y sus administradores poblados
 */
router.get("/:id/administradores", async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id).populate(
      "administradores"
    );
    if (!grupo) {
      return res.status(404).send("No existe un grupo con el id especificado");
    }
    return res.status(200).send(grupo);
  } catch (error) {
    res.status(500).send();
  }
});

/**
 * Devuelve el grupo con el id especificado y sus integrantes poblados
 */
router.get("/:id/integrantes", async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id).populate("integrantes");
    if (!grupo) {
      return res.status(404).send("No existe un grupo con el id especificado");
    }
    return res.status(200).send(grupo);
  } catch (error) {
    res.status(500).send();
  }
});

/**
 * Devuelve el grupo con el id especificado y sus eventos poblados
 */
router.get("/:id/eventos", async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id).populate("eventos");
    if (!grupo) {
      return res.status(404).send("No existe un grupo con el id especificado");
    }
    return res.status(200).send(grupo);
  } catch (error) {
    res.status(500).send();
  }
});

/**
 * Devuelve el grupo con el id especificado y sus eventos, administradores e integrantes poblados
 */
router.get("/:id/todos", async (req, res) => {
  try {
    const grupo = await await Grupo.findById(req.params.id)
      .populate("eventos")
      .populate("integrantes")
      .populate("administradores");
    if (!grupo) {
      return res.status(404).send("No existe un grupo con el id especificado");
    }
    return res.status(200).send(grupo);
  } catch (error) {
    res.status(500).send();
  }
});

/**
 *  Modifica un grupo con el id especificado
 */
router.patch("/:id", async (req, res) => {
  // Se pueden pasar por parametro los campos no modificables
  try {
    if (!Grupo.fieldsNotAllowedUpdates(req.body)) {
      return res.status(400).send({ error: "Invalid updates" });
    }
    ("console.log(req.body)");
    const grupo = await Grupo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!grupo) {
      return res.status(404).send("No existe un grupo con el id especificado");
    }
    return res.send(grupo);
  } catch (e) {
    return res.status(400).send(e);
  }
});

/**
 *  Modifica un grupo con el id especificado, agregandole un administrador existente
 */
router.patch("/:idG/administradores/:idU", async (req, res) => {
  // Se pueden pasar por parametro los campos no modificables
  try {
    const grupo = await Grupo.findById(req.params.idG);
    if (!grupo) {
      return res.status(404).send("No existe un grupo con el id especificado");
    }
    const usuario = await Usuario.findById(req.params.idU);
    if (!usuario) {
      return res
        .status(404)
        .send("No existe un usuario con el id especificado");
    }
    grupo.administradores.push(usuario.id);
    grupo.save();
    return res.send(grupo);
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

/**
 *  Modifica un grupo con el id especificado, agregandole un integrante existente
 */
router.patch("/:idG/integrantes/:idU", async (req, res) => {
  // Se pueden pasar por parametro los campos no modificables
  try {
    const grupo = await Grupo.findById(req.params.idG);
    if (!grupo) {
      return res.status(404).send("No existe un grupo con el id especificado");
    }
    const usuario = await Usuario.findById(req.params.idU);
    if (!usuario) {
      return res
        .status(404)
        .send("No existe un usuario con el id especificado");
    }
    grupo.integrantes.push(usuario.id);
    grupo.save();
    return res.send(grupo);
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

/**
 *  Modifica un grupo con el id especificado, agregandole un evento existente
 */
router.patch("/:idG/eventos/:idE", async (req, res) => {
  // Se pueden pasar por parametro los campos no modificables
  try {
    const grupo = await Grupo.findById(req.params.idG);
    if (!grupo) {
      return res.status(404).send("No existe un grupo con el id especificado");
    }
    const evento = await Evento.findById(req.params.idE);
    if (!evento) {
      return res.status(404).send("No existe un evento con el id especificado");
    }
    grupo.eventos.push(evento.id);
    grupo.save();
    return res.send(grupo);
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

/**
 * Elimina un grupo con el id especificado
 */
router.delete("/:id", async (req, res) => {
  try {
    const grupo = await Grupo.findByIdAndDelete(req.params.id);
    if (!grupo) {
      return res.status(404).send();
    }
    res.send(grupo);
  } catch (error) {
    return res.status(500).send();
  }
});

module.exports = router;
