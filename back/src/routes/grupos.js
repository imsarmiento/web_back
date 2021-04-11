const express = require("express");
const Grupo = require("../models/grupo-model");
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
    return res.status(200).send(equipo);
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
      return res.status(404).send();
    }
    return res.send(grupo);
  } catch (e) {
    return res.status(400).send(e);
  }
});

/**
 * Elimina un grupo
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
