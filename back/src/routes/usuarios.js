const express = require("express");
const Usuario = require("../models/usuario-model");
const Evento = require("../models/evento-model");
const router = new express.Router();

/**
 * USUARIO
 */

/**
 * LOGIN
 */
/**
 * Retorna los datos del usuario si sus credenciales son correctos
 */
router.post("/login", async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ correo: req.body.correo });
    console.log(usuario);
    if (!usuario) {
      return res.status(401).send({ error: "El usuario no esta registrado" });
    }
    if (usuario.contrasena !== req.body.contrasena) {
      return res
        .status(401)
        .send({ error: "La contraseña ingresada es incorrecta" });
    }
    res.send(usuario);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

/**
 * CRUD
 */

/**
 * Crea un usuario
 */
router.post("/", async (req, resp) => {
  try {
    let usuario = await Usuario.findOne({ correo: req.body.correo });
    if (usuario) {
      return resp
        .status(409)
        .send({ error: "Ya existe un usuario con el correo especificado" });
    }
    usuario = new Usuario(req.body);
    await usuario.save();
    return resp.status(201).send(usuario);
  } catch (error) {
    console.log(error);
    resp.status(500).send({ error: "Hubo un error en el registro" });
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
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

/**
 * Devuelve el usuario con el id especificado
 */
router.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).populate({
      path: "eventos",
      populate: { path: "creador" },
    });
    if (!usuario) {
      return res
        .status(404)
        .send({ error: "No existe un usuario con el id especificado" });
    }
    return res.status(200).send(usuario);
  } catch (error) {
    res.status(500).send({ error: error });
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
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!usuario) {
      return res
        .status(404)
        .send({ error: "No existe un usuario con el id especificado" });
    }
    return res.status(201).send(usuario);
  } catch (error) {
    return res.status(400).send({ error: error });
  }
});

/**
 * Elimina un usuario con el id especificado
 */
router.delete("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res
        .status(404)
        .send({ error: "No existe un usuario con el id especificado" });
    }
    res.status(204).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

/**
 * Obtener disponibilidad
 */

/**
 * Devuelve el usuario con el correo especificado
 */
router.get("/correo/:correo", async (req, res) => {
  try {
    console.log("correo");
    const usuario = await Usuario.findOne({ correo: req.params.correo });
    if (!usuario) {
      return res
        .status(404)
        .send({ error: "No existe un usuario con el correo especificado" });
    }
    return res.status(200).send(usuario);
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

/**
 * Devuelve el la disponibilidad de los usuarios con correos especificados
 */
router.post("/disponibilidad", async (req, res) => {
  try {
    let disp = [];
    let past = new Date(req.body.fechaInicio);
    let future = new Date(req.body.fechaFin);
    const usuarios = req.body.correos;
    console.log(usuarios);
    let size = usuarios.length;
    if (size < 1) {
      return res.status(400).send({
        error: "Debe ingresarse por lo menos un correo de un usuario existente",
      });
    }
    for (let k = 0; k < size; k++) {
      disp.push([]);
      disp[k].push({ start: past, end: future });
      const usuario = await Usuario.findOne({ correo: usuarios[k] }).populate({
        path: "eventos",
        $match: {
          $or: [{ diaInicio: { $gte: past } }, { diaFin: { $lte: future } }],
        },
        populate: {
          path: "reglas",
          options: { sort: { unidad: 1 } },
        },
        options: { sort: { diaInicio: 1 } },
      });
      if (usuario === null) {
        return res
          .status(404)
          .send({ error: `Existe un correo que no está registrado` });
      }
      usuario.eventos.forEach((evento) => {
        const diaFin = new Date(evento.diaFin);
        if (evento.frecuencia === "sinRepetir") {
          for (let j = 0; j < evento.reglas.length; j++) {
            const regla = evento.reglas[j];
            let diaIterador = regla.horaInicio;
            let diaIteradorFin = regla.horaFin;
            let length = disp[k].length;
            for (let i = 0; i < length; i++) {
              if (disp[k][i].end > diaIterador) {
                let end = new Date(disp[k][i].end);
                disp[k][i].end = new Date(diaIterador);
                const new_dis = { start: new Date(diaIteradorFin), end: end };
                disp[k].splice(i + 1, 0, new_dis);
                break;
              }
            }
          }
        } else if (evento.frecuencia === "semanal") {
          for (let j = 0; j < evento.reglas.length; j++) {
            const regla = evento.reglas[j];
            let diaIterador = regla.horaInicio;
            let diaIteradorFin = regla.horaFin;
            diaIterador.setDate(diaIterador.getDate() + regla.unidad);
            diaIteradorFin.setDate(diaIteradorFin.getDate() + regla.unidad);
            while (diaIterador <= diaFin) {
              let length = disp[k].length;
              for (let i = 0; i < length; i++) {
                if (disp[k][i].end < past) {
                  disp[k].splice(i, 1);
                  i--;
                } else if (disp[k][i].end > diaIterador) {
                  let end = new Date(disp[k][i].end);
                  disp[k][i].end = new Date(diaIterador);
                  const new_dis = {
                    start: new Date(diaIteradorFin),
                    end: end,
                  };
                  disp[k].splice(i + 1, 0, new_dis);
                  break;
                }

                length = disp[k].length;
              }
              diaIterador.setDate(diaIterador.getDate() + 7);
              diaIteradorFin.setDate(diaIteradorFin.getDate() + 7);
            }
          }
        } else if (evento.frecuencia === "mensual") {
          for (let j = 0; j < evento.reglas.length; j++) {
            const regla = evento.reglas[j];
            let diaIterador = regla.horaInicio;
            let diaIteradorFin = regla.horaFin;
            diaIterador.setDate(diaIterador.getDate() + regla.unidad);
            diaIteradorFin.setDate(diaIteradorFin.getDate() + regla.unidad);
            while (diaIterador <= diaFin) {
              let length = disp[k].length;
              for (let i = 0; i < length; i++) {
                if (disp[k][i].end < past) {
                  disp[k].splice(i, 1);
                  i--;
                } else if (disp[k][i].end > diaIterador) {
                  let end = new Date(disp[k][i].end);
                  disp[k][i].end = new Date(diaIterador);
                  const new_dis = {
                    start: new Date(diaIteradorFin),
                    end: end,
                  };
                  disp[k].splice(i + 1, 0, new_dis);
                  break;
                }
                length = disp[k].length;
              }
              diaIterador.setMonth(diaIterador.getMonth() + 1);
              diaIteradorFin.setMonth(diaIteradorFin.getMonth() + 1);
            }
          }
        }
      });
    }
    const final = disp[0];
    size = final.length;
    if (disp.length > 1) {
      let sizeI = disp.length;
      for (let i = 1; i < sizeI; i++) {
        let sizeJ = disp[i].length;
        let k = 0;
        for (let j = 0; j < sizeJ; j++) {
          let stop = false;
          while (k < size && !stop) {
            if (disp[i][j].start >= final[k].end) {
              final.splice(k, 1);
            } else {
              if (disp[i][j].end >= final[k].end) {
                if (disp[i][j].start >= final[k].start) {
                  final[k].start = new Date(disp[i][j].start);
                }
                k++;
                if (k < size) {
                  disp[i][j].start = new Date(final[k].start);
                  if (disp[i][j].end <= disp[i][j].start) {
                    stop = true;
                  }
                }
              } else {
                if (disp[i][j].start >= final[k].start) {
                  final[k].start = new Date(disp[i][j].start);
                }
                if (final[k].end >= disp[i][j].end) {
                  let tempEnd = new Date(final[k].end);
                  final[k].end = new Date(disp[i][j].end);
                  final.splice(k + 1, 0, {
                    start: new Date(final[k].end),
                    end: tempEnd,
                  });
                }
                k++;
                stop = true;
              }
            }
            size = final.length;
          }
        }
      }
    }

    let i = 0;
    size = final.length;
    while (i < size) {
      let tempInicio = new Date(final[i].start);
      tempInicio.setHours(0, 0, 0, 0);
      let tempFin = new Date(final[i].end);
      tempFin.setHours(0, 0, 0, 0);
      if (tempInicio.getTime() !== tempFin.getTime()) {
        while (tempInicio.getTime() !== tempFin.getTime()) {
          let newStart = new Date(final[i].start);
          newStart.setHours(0, 0, 0, 0);
          newStart.setDate(newStart.getDate() + 1);
          let newEnd = new Date(newStart);
          newEnd.setTime(newEnd.getTime() - 1);
          let temp = new Date(final[i].end);
          final[i].end = new Date(newEnd);
          let newDis = { start: new Date(newStart), end: new Date(temp) };
          Object.assign(final[i], { id: i, title: "Disponible" });
          i++;
          final.splice(i, 0, newDis);
          tempInicio.setDate(tempInicio.getDate() + 1);
        }
      } else {
        if (final[i].start.getTime() === final[i].end.getTime()) {
          final.splice(i, 1);
        } else {
          Object.assign(final[i], { id: i, title: "Disponible" });
          i++;
        }
      }
      size = final.length;
    }
    return res.status(200).send(final);
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

/**
 * Devuelve el usuario con el id especificado y sus eventos poblados
 */
router.get("/:id/eventos", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).populate({
      path: "eventos",
      populate: { path: "creador" },
    });
    if (!usuario) {
      return res
        .status(404)
        .send("No existe un usuario con el id especificado");
    }
    return res.status(200).send(usuario.eventos);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
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
        .send({ error: "No existe un usuario con el id especificado" });
    }
    const evento = await Evento.findById(req.params.idE);
    if (!evento) {
      return res
        .status(404)
        .send({ error: "No existe un evento con el id especificado" });
    }
    usuario.eventos.push(evento.id);
    usuario.save();
    return res.send(usuario);
  } catch (error) {
    return res.status(400).send({ error: error });
  }
});

/**
 * Ver eventos del usuario
 */

/**
 * Devuelve los eventos que siguen siendo relevantes para el usuario con el id especificado
 */
router.get("/:id/eventosFuturos", async (req, res) => {
  try {
    const fechaActual = new Date();
    const usuario = await Usuario.findById(req.params.id).populate({
      path: "eventos",
      $match: {
        $or: [{ diaFin: { $gte: new Date() } }],
      },
      populate: {
        path: "reglas",
      },
    });
    if (!usuario) {
      return res
        .status(404)
        .send({ error: "No existe un usuario con el id especificado" });
    }
    const eventos = [];
    usuario.eventos.forEach((evento) => {
      if (evento.frecuencia === "sinRepetir") {
        let sizeEvento = evento.reglas.length;
        for (let j = 0; j < sizeEvento; j++) {
          const regla = evento.reglas[j];
          let diaIterador = new Date(regla.horaInicio);
          let diaIteradorFin = new Date(regla.horaFin);
          if (fechaActual < diaIteradorFin) {
            eventos.push({
              start: diaIterador,
              end: diaIteradorFin,
              title: evento.nombre,
            });
          }
        }
      } else if (evento.frecuencia === "semanal") {
        let sizeEvento = evento.reglas.length;
        for (let j = 0; j < sizeEvento; j++) {
          const regla = evento.reglas[j];
          let diaIterador = new Date(regla.horaInicio);
          let diaIteradorFin = new Date(regla.horaFin);
          diaIterador.setDate(diaIterador.getDate() + regla.unidad);
          diaIteradorFin.setDate(diaIteradorFin.getDate() + regla.unidad);
          while (evento.diaFin >= diaIterador) {
            if (fechaActual < diaIteradorFin) {
              eventos.push({
                start: new Date(diaIterador),
                end: new Date(diaIteradorFin),
                title: evento.nombre,
              });
            }
            diaIterador.setDate(diaIterador.getDate() + 7);
            diaIteradorFin.setDate(diaIteradorFin.getDate() + 7);
          }
        }
      } else if (evento.frecuencia === "mensual") {
        let sizeEvento = evento.reglas.length;
        for (let j = 0; j < sizeEvento; j++) {
          const regla = evento.reglas[j];
          let diaIterador = new Date(regla.horaInicio);
          let diaIteradorFin = new Date(regla.horaFin);
          diaIterador.setDate(diaIterador.getDate() + regla.unidad);
          diaIteradorFin.setDate(diaIteradorFin.getDate() + regla.unidad);
          while (evento.diaFin >= diaIterador) {
            if (fechaActual < diaIteradorFin) {
              eventos.push({
                start: new Date(diaIterador),
                end: new Date(diaIteradorFin),
                title: evento.nombre,
              });
            }
            diaIterador.setMonth(diaIterador.getMonth() + 1);
            diaIteradorFin.setMonth(diaIteradorFin.getMonth() + 1);
          }
        }
      }
    });
    let i = 0;
    let size = eventos.length;
    while (i < size) {
      let tempInicio = new Date(eventos[i].start);
      tempInicio.setHours(0, 0, 0, 0);
      let tempFin = new Date(eventos[i].end);
      tempFin.setHours(0, 0, 0, 0);
      if (tempInicio.getTime() !== tempFin.getTime()) {
        while (tempInicio.getTime() !== tempFin.getTime()) {
          let newStart = new Date(eventos[i].start);
          newStart.setHours(0, 0, 0, 0);
          newStart.setDate(newStart.getDate() + 1);
          let newEnd = new Date(newStart);
          newEnd.setTime(newEnd.getTime() - 1);
          let temp = new Date(eventos[i].end);
          eventos[i].end = new Date(newEnd);
          let newDis = { start: new Date(newStart), end: new Date(temp) };
          Object.assign(eventos[i], { id: i, title: "Disponible" });
          i++;
          eventos.splice(i, 0, newDis);
          tempInicio.setDate(tempInicio.getDate() + 1);
        }
      } else {
        Object.assign(eventos[i], { id: i });
        i++;
      }
      size = eventos.length;
    }
    return res.send(eventos);
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

module.exports = router;
