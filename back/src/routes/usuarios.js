const express = require("express");
const Usuario = require("../models/usuario-model");
const router = new express.Router();

/**
 * USUARIO
 */

/**
 * Crea un usuario
 */
router.post("/", async (req, resp) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    return resp.status(201).send(usuario);
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
    console.log("entra");
    const usuarios = await Usuario.find({});
    console.log(usuarios);
    return res.send(usuarios);
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * Devuelve el usuario con el id especificado
 */
router.get("/:id", async (req, res) => {
  try {
    console.log("entra id");
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res
        .status(404)
        .send("No existe un usuario con el id especificado");
    }
    return res.status(200).send(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

/**
 *  Modifica un usuario con el id especificado
 */
router.patch("/:id", async (req, res) => {
  // Se pueden pasar por parametro los campos no modificables
  try {
    if (!Usuario.fieldsNotAllowedUpdates(req.body)) {
      return res.status(400).send({ error: "Invalid updates" });
    }
    ("console.log(req.body)");
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!usuario) {
      return res.status(404).send();
    }
    return res.send(usuario);
  } catch (e) {
    return res.status(400).send(e);
  }
});

/**
 * Elimina un usuario
 */
router.delete("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).send();
    }
    res.send(usuario);
  } catch (error) {
    return res.status(500).send();
  }
});

module.exports = router;
