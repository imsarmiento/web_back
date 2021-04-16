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
router.post("/login", async (req, res) => {
    try {
        const usuario = await Usuario.findOne({correo: req.body.correo});
        console.log(usuario);
        if (!usuario) {
            return res.status(401).send({error: "El usuario no esta registrado"});
        }
        if (!(usuario.contrasena === req.body.contrasena)) {
            return res
                .status(401)
                .send({error: "La contraseña ingresada es incorrecta"});
        }
        res.send(usuario);
    } catch (error) {
        return res.status(500).send({error: error});
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
        resp.status(400).send({error: "La contraseña ingresada es incorrecta"});
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
        res.status(500).send({error: error});
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
                .send({error: "No existe un usuario con el id especificado"});
        }
        return res.status(200).send(usuario);
    } catch (error) {
        res.status(500).send({error: error});
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
        res.status(500).send({error: error});
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
                options: {sort: {unidad: 1}},
            },
            options: {sort: {diaInicio: 1}},
        });
        if (!usuario) {
            return res
                .status(404)
                .send({error: "No existe un usuario con el id especificado"});
        }
        return res.status(200).send(usuario);
    } catch (error) {
        res.status(500).send({error: error});
    }
});

/**
 *  Modifica un usuario con el id especificado
 */
router.patch("/:id", async (req, res) => {
    // Se pueden pasar por parametro los campos no modificables
    try {
        if (!Usuario.fieldsNotAllowedUpdates(req.body)) {
            return res.status(400).send({error: "Invalid updates"});
        }
        const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!usuario) {
            return res
                .status(404)
                .send({error: "No existe un usuario con el id especificado"});
        }
        return res.send(usuario);
    } catch (error) {
        return res.status(400).send({error: error});
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
                .send({error: "No existe un usuario con el id especificado"});
        }
        const evento = await Evento.findById(req.params.idE);
        if (!evento) {
            return res
                .status(404)
                .send({error: "No existe un evento con el id especificado"});
        }
        usuario.eventos.push(evento.id);
        usuario.save();
        return res.send(usuario);
    } catch (error) {
        return res.status(400).send({error: error});
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
                .send({error: "No existe un usuario con el id especificado"});
        }
        res.send(usuario);
    } catch (error) {
        return res.status(500).send({error: error});
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
                options: {sort: {unidad: 1}},
            },
            options: {sort: {diaInicio: 1}},
        });
        if (!usuario) {
            return res
                .status(404)
                .send({error: "No existe un usuario con el id especificado"});
        }
        let disp = [];
        let past = new Date("January 1, 2021 00:00:00");
        let future = new Date("January 1, 2022 00:00:00");
        disp.push({start: past, end: future});
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
                            if (dis.end > reglaInicio) {
                                const temp = dis.end;
                                dis.end = reglaInicio;
                                const new_dis = {start: reglaFin, end: temp};
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
                        diaIterador.setDate(diaIterador.getDate()+regla.unidad);
                        diaIteradorFin.setDate(diaIteradorFin.getDate()+regla.unidad);
                        while (diaIterador < diaFin) {
                            for (var i = 0; i < disp.length; i++) {
                                let dis = disp[i];
                                if (dis.end > diaIterador) {
                                    let end = new Date(disp[i].end);
                                    disp[i].end = new Date(diaIterador);
                                    const new_dis = {start: new Date(diaIteradorFin), end: end};
                                    disp.splice(i + 1, 0, new_dis);
                                    break;
                                }

                            }
                            diaIterador.setDate(diaIterador.getDate() + 7);
                            diaIteradorFin.setDate(diaIteradorFin.getDate() + 7);
                        }

                    }

                } else if (evento.frecuencia === "mensual") {
                    for (var j = 0; j < evento.reglas.length; j++) {
                        const regla = evento.reglas[j];
                        let diaIterador = regla.horaInicio;
                        let diaIteradorFin = regla.horaFin;
                        diaIterador.setDate(diaIterador.getDate() + regla.unidad);
                        diaIteradorFin.setDate(diaIteradorFin.getDate() + regla.unidad);
                        while (diaIterador < diaFin) {
                            for (var i = 0; i < disp.length; i++) {
                                let dis = disp[i];
                                if (dis.end > diaIterador) {
                                    let end = new Date(disp[i].end);
                                    disp[i].end = new Date(diaIterador);
                                    const new_dis = {start: new Date(diaIteradorFin), end: end};
                                    disp.splice(i + 1, 0, new_dis);
                                    break;
                                }

                            }
                            diaIterador.setMonth(diaIterador.getMonth() + 1);
                            diaIteradorFin.setMonth(diaIteradorFin.getMonth() + 1);
                        }

                    }
                }
            }
        });
        let i = 0;

        let size = disp.length;
        while (i < size) {
            let tempInicio = new Date(disp[i].start);
            tempInicio.setHours(0, 0, 0, 0);
            let tempFin = new Date(disp[i].end);
            tempFin.setHours(0, 0, 0, 0);
            if (tempInicio.getTime() !== tempFin.getTime()) {
                while (tempInicio.getTime() !== tempFin.getTime()) {
                    let newStart = new Date(disp[i].start);
                    newStart.setHours(0, 0, 0, 0);
                    newStart.setDate(newStart.getDate() + 1);
                    let newEnd = new Date(newStart);
                    newEnd.setTime(newEnd.getTime() - 2);
                    let temp = new Date(disp[i].end);
                    disp[i].end=new Date(newEnd);
                    let newDis = {start: new Date(newStart), end: new Date(temp)};
                    i++;
                    disp.splice(i, 0, newDis);
                    tempInicio.setDate(tempInicio.getDate()+1);
                    console.log(disp[i].end)
                }

            } else {
                i++;
            }
            size = disp.length;
        }


        size = disp.length;
        for (let i = 0; i < size; i++) {
            Object.assign(disp[i], {id: i, title: "Disponible"});
        }

        return res.status(200).send(disp);
    } catch (error) {
        res.status(500).send({error: error});
    }
});

function setTimeCero(date) {
    date.setHo
}

module.exports = router;
