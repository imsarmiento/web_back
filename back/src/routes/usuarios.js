const express = require("express");
const Usuario = require("../models/usuario-model");
const Evento = require("../models/evento-model");
const router = new express.Router();

/**
 * USUARIO
 */

/**
 * Retorna los datos del usuario si sus credenciales son correctos
 */
router.get("/login", async (req, res) => {
  try {
    const usuario = await Usuario.find({correo:req.body.correo});
    if (!usuario) {
      return res.status(404).send("El usuario no esta registrado");
    }
    if(!usuario.contrasena==req.body.contrasena){
      return res.status(401).send("Los datos de autenticacion son incorrectos");
    }
     res.send(usuario);
  } catch (error) {
    return res.status(500).send();
  }
});

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
 * Devuelve el usuario con el id especificado y sus eventos poblados
 */
router.get("/:id/eventos", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).populate("eventos");
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
 *  Modifica un usuario con el id especificado, agregandole un evento existente
 */
router.patch("/:idU/eventos/:idE", async (req, res) => {
  // Se pueden pasar por parametro los campos no modificables
  try {
    const usuario = await Usuario.findById(req.params.idU);
    if (!usuario) {
      return res
        .status(404)
        .send("No existe un usuario con el id especificado");
    }
    const evento = await Evento.findById(req.params.idE);
    if (!evento) {
      return res.status(404).send("No existe un evento con el id especificado");
    }
    usuario.eventos.push(evento.id);
    usuario.save();
    return res.send(usuario);
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

/**
 * Elimina un usuario con el id especificado
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
