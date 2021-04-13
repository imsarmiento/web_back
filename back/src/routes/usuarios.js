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
router.put("/login", async (req, res) => {
  try {
    const usuario = await Usuario.find({ correo: req.body.correo });
    if (!usuario) {
      return res.status(404).send("El usuario no esta registrado");
    }
    if (!(usuario[0].contrasena === req.body.contrasena)) {
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
 * Devuelve el usuario con el id especificado y sus eventos poblados con sus reglas pobladas
 */
router.get("/:id/eventos_reglas", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).populate({
      path: "eventos",
      populate: {
        path: "reglas",
        options: { sort: { unidad: 1 } },
      },
      options: { sort: { diaInicio: 1 } },
    });
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

/**
 * Devuelve el la disponibilidad del usuario con el id especificado
 */
router.get("/:id/disponibilidad", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).populate({
      path: "eventos",
      populate: {
        path: "reglas",
        options: { sort: { unidad: 1 } },
      },
      options: { sort: { diaInicio: 1 } },
    });
    if (!usuario) {
      return res
        .status(404)
        .send("No existe un usuario con el id especificado");
    }
    let disp = [];
    let past = new Date();
    let future = new Date();
    past.setFullYear(past.getFullYear() - 5);
    future.setFullYear(future.getFullYear() + 5);
    disp.push({ inicio: past, fin: future });
    usuario.eventos.forEach((evento) => {
      const diaInicio = new Date(evento.diaInicio);
      const diaFin = new Date(evento.diaFin);
      // NO tomar en cuenta los eventos anteriores al dia de hoy
      if (true) {
        // Se consideran primero los casos en los que no hay una frecuencia
        if (evento.frecuencia === "sinRepetir") {
          for (var j = 0; j < evento.reglas.length; j++) {
            const regla = evento.reglas[j];
            const reglaInicio = new Date(regla.horaInicio);
            const reglaFin = new Date(regla.horaFin);
            for (var i = 0; i < disp.length; i++) {
              let dis = disp[i];
              if (dis.fin > reglaInicio) {
                const temp = dis.fin;
                dis.fin = reglaInicio;
                const new_dis = { inicio: reglaFin, fin: temp };
                disp.splice(i + 1, 0, new_dis);
                break;
              }
            }
          }
        } else if (evento.frecuencia === "semanal") {
          for (var j = 0; j < evento.reglas.length; j++) {
            const regla = evento.reglas[j];
            let diaIterador = regla.horaInicio;
            let diaIteradorFin = regla.horaFin;
            while (diaIterador < diaFin) {
              for (var i = 0; i < disp.length; i++) {
                let dis = disp[i];
                if (dis.fin > diaIterador) {
                  const temp = dis.fin;
                  dis.fin = diaIterador;
                  const new_dis = { inicio: diaIteradorFin, fin: temp };
                  disp.splice(i + 1, 0, new_dis);
                  break;
                }
              }
              diaIterador = new Date(
                diaIterador.getTime() + 7 * 24 * 60 * 60 * 1000
              );
              diaIteradorFin = new Date(
                diaIterador.getTime() + 7 * 24 * 60 * 60 * 1000
              );
            }
          }
        } else if (evento.frecuencia === "mensual") {
          for (var j = 0; j < evento.reglas.length; j++) {
            const regla = evento.reglas[j];
            let diaIterador = regla.horaInicio;
            //console.log("diaIterador", diaIterador);
            //console.log("diaFin", diaFin);
            let diaIteradorFin = regla.horaFin;
            while (diaIterador < diaFin) {
              for (var i = 0; i < disp.length; i++) {
                let dis = disp[i];
                //console.log("dis.fin", dis.fin);
                //console.log("diaIterador", diaIterador);
                if (dis.fin > diaIterador) {
                  //console.log("entra");
                  //console.log("diaIterador", diaIterador);
                  //console.log("dis a modificar", dis);
                  const temp = dis.fin;
                  dis.fin = diaIterador;
                  //console.log("antes", disp);
                  const new_dis = { inicio: diaIteradorFin, fin: temp };
                  disp.splice(i + 1, 0, new_dis);
                  //console.log("despues", disp);
                  break;
                }
              }
              diaIterador = new Date(diaIterador.getTime());
              diaIterador.setMonth((diaIterador.getMonth() + 1) % 12);
              //console.log(diaIterador);
              diaIteradorFin = new Date(diaIteradorFin.getTime());
              diaIteradorFin.setMonth((diaIteradorFin.getMonth() + 1) % 12);
            }
          }
        }
      }
      //console.log(disp);
    });
    return res.status(200).send(disp);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

module.exports = router;
