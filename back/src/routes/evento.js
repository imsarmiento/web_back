const express = require("express");
const Evento = require("../models/evento-model");
const Usuario = require("../models/usuario-model");
const Regla = require("../models/regla-model");
const router = new express.Router();

/**
 * EVENTO
 */

/**
 *  Devuelve todos los evento con el id especificado
 */
router.get("/:id", async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).send({error: "No hubo coincidencia de evento"});
        }
        return res.status(200).send(evento);
    } catch (error) {
        res.status(500).send({error: error});
    }
});

/**
 *  Devuelve todos los eventos
 */
router.get("/", async (req, res) => {
    try {
        const eventos = await Evento.find({});
        return res.send(eventos);
    } catch (error) {
        res.status(500).send({error: error});
    }
});

/**
 * Crea un evento
 */
router.post("/", async (req, resp) => {
    try {
        const evento = new Evento(req.body);
        await evento.save();
        return resp.status(201).send(evento);
    } catch (error) {
        resp.status(400).send({error: error});
    }
});

/**
 *  Modifica un evento con el id especificado
 */
router.patch("/:id", async (req, res) => {
    try {
        const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!evento) {
            return res.status(404).send({error: "No hubo coincidencia de evento"});
        }
        return res.send(evento);
    } catch (error) {
        return res.status(400).send({error: error});
    }
});

/**
 * Elimina un evento con el id especificado
 */
router.delete("/:id", async (req, res) => {
    try {
        const evento = await Evento.findByIdAndDelete(req.params.id);
        if (!evento) {
            return res.status(404).send({error: "No hubo coincidencia de evento"});
        }
        res.send(evento);
    } catch (error) {
        return res.status(500).send({error: error});
    }
});

/**
 * Devuelve el evento con el id especificado y sus reglas poblados
 */
router.get("/:id/reglas", async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id).populate("reglas");
        if (!evento) {
            return res.status(404).send({error: "No hubo coincidencia de evento"});
        }
        return res.status(200).send(evento);
    } catch (error) {
        res.status(500).send({error: error});
    }
});

/**
 *  Modifica un evento con el id especificado, agregandole una regla existente
 */
router.patch("/:id/reglas/:idRegla", async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).send({error: "No hubo coincidencia de evento"});
        }
        console.log(evento);
        const regla = await Regla.findById(req.params.idRegla);
        if (!regla) {
            return res.status(404).send({error: "No hubo coincidencia de regla"});
        }
        console.log(regla);
        evento.reglas.push(regla);
        evento.save();
        return res.send(evento);
    } catch (error) {
        return res.status(400).send({error: error});
    }
});

/**
 * Crea un evento para un grupo de usuarios con correos especificados si se logra agendar a todos
 */
router.post("/crearEventoCompleto", async (req, res) => {
        try {
            let eventos = [];
            let usuarios = [];
            let usuariosParam = req.body.correos;
            let eventoParam = req.body.evento;
            let size = usuariosParam.length;
            for (let i = 0; i < size; i++) {
                const usuario = await Usuario.findOne({correo: usuariosParam[i]}).populate({
                    path: "eventos",
                    $match: {
                        $or: [
                            {diaInicio: {$gte: eventoParam.start}},
                            {diaFin: {$lte: eventoParam.end}}]
                    },
                    populate: {
                        path: "reglas",
                    }
                });
                if (!usuario) {
                    return res
                        .status(404)
                        .send({error: "No existe un usuario con el correo " + usuariosParam[i]});
                }
                usuarios.push(usuario);
                eventos.concat(usuario.eventos);
                usuario.eventos.forEach((evento) => {
                    const diaFin = new Date(eventoParam.diaFin);
                    if (evento.frecuencia === "sinRepetir") {
                        let sizeEvento = evento.reglas.length;
                        for (let j = 0; j < sizeEvento; j++) {
                            const regla = evento.reglas[j];
                            let diaIterador = new Date(regla.horaInicio);
                            let diaIteradorFin = new Date(regla.horaFin);
                            eventos.push({start: diaIterador, end: diaIteradorFin});
                        }
                    } else if (evento.frecuencia === "semanal") {
                        let sizeEvento = evento.reglas.length;
                        for (let j = 0; j < sizeEvento; j++) {
                            const regla = evento.reglas[j];
                            let diaIterador = new Date(regla.horaInicio);
                            let diaIteradorFin = new Date(regla.horaFin);
                            diaIterador.setDate(diaIterador.getDate() + regla.unidad);
                            diaIteradorFin.setDate(diaIteradorFin.getDate() + regla.unidad);
                            while ((diaFin > diaIterador) && (evento.diaFin > diaIterador)) {
                                eventos.push({start: new Date(diaIterador), end: new Date(diaIteradorFin)});
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
                            while ((diaFin > diaIterador) && (evento.diaFin > diaIterador)) {
                                eventos.push({start: new Date(diaIterador), end: new Date(diaIteradorFin)});
                                diaIterador.setMonth(diaIterador.getMonth() + 1);
                                diaIteradorFin.setMonth(diaIteradorFin.getMonth() + 1);
                            }
                        }
                    }

                });
            }
            size = eventoParam.reglas.length;
            const diaFin = new Date(eventoParam.diaFin);
            let eventosSize = eventos.length;
            for (let i = 0; i < size; i++) {
                const regla = eventoParam.reglas[i];
                for (let j = 0; j < eventosSize; j++) {
                    if (eventoParam.frecuencia === "sinRepetir") {
                        const reglaInicio = new Date(regla.horaInicio);
                        const reglaFin = new Date(regla.horaFin);
                        if (reglaFin <= eventos[j].end && reglaFin >= eventos[j].start) {
                            return res
                                .status(500)
                                .send({error: "Existe un conflicto de horario"});
                        } else if (reglaInicio <= eventos[j].end && reglaInicio >= eventos[j].start) {
                            return res
                                .status(500)
                                .send({error: "Existe un conflicto de horario"});
                        }
                    } else if (eventoParam.frecuencia === "semanal") {
                        const reglaInicio = new Date(regla.horaInicio);
                        const reglaFin = new Date(regla.horaFin);
                        reglaInicio.setDate(reglaInicio.getDate() + regla.unidad);
                        reglaFin.setDate(reglaFin.getDate() + regla.unidad);
                        while (reglaInicio <= diaFin) {
                            if (reglaFin <= eventos[j].end && reglaFin >= eventos[j].start) {
                                return res
                                    .status(500)
                                    .send({error: "Existe un conflicto de horario"});
                            } else if (reglaInicio <= eventos[j].end && reglaInicio >= eventos[j].start) {
                                return res
                                    .status(500)
                                    .send({error: "Existe un conflicto de horario"});
                            }
                            reglaInicio.setDate(reglaInicio.getDate() + 7);
                            reglaFin.setDate(reglaFin.getDate() + 7);
                        }
                    } else if (eventoParam.frecuencia === "mensual") {
                        const reglaInicio = new Date(regla.horaInicio);
                        const reglaFin = new Date(regla.horaFin);
                        reglaInicio.setDate(reglaInicio.getDate() + regla.unidad);
                        reglaFin.setDate(reglaFin.getDate() + regla.unidad);
                        while (reglaInicio <= diaFin) {
                            if (reglaFin <= eventos[j].end && reglaFin >= eventos[j].start) {
                                return res
                                    .status(500)
                                    .send({error: "Existe un conflicto de horario"});
                            } else if (reglaInicio <= eventos[j].end && reglaInicio >= eventos[j].start) {
                                return res
                                    .status(500)
                                    .send({error: "Existe un conflicto de horario"});
                            }
                            reglaInicio.setMonth(reglaInicio.getMonth() + 1);
                            reglaFin.setMonth(reglaFin.getMonth() + 1);
                        }
                    }
                }
                const reglas = eventoParam.reglas;
                eventoParam.reglas = [];
                const evento = new Evento(eventoParam);
                const response = await evento.save();
                let sizeReglas = reglas.length;
                for (let j = 0; j < sizeReglas; j++) {
                    const regla = new Regla(reglas[j]);
                    response.reglas.push(await regla.save());
                    await response.save();
                }
                size = usuarios.length;
                for (let i = 0; i < size; i++) {
                    const usuario = usuarios[i];
                    usuario.eventos.push(response);
                    await usuario.save();
                }
                return res.send(usuarios);
            }
        } catch
            (error) {
            return res.status(400).send({error: error});
        }
    }
);

/**
 * Verifica un evento para un grupo de usuarios con correos especificados si se puede agendar a todos
 */
router.post("/verificarDisponibilidad", async (req, res) => {
        try {
            let eventos = [];
            let usuarios = [];
            let usuariosParam = req.body.correos;
            let eventoParam = req.body.evento;
            let size = usuariosParam.length;
            for (let i = 0; i < size; i++) {
                const usuario = await Usuario.findOne({correo: usuariosParam[i]}).populate({
                    path: "eventos",
                    $match: {
                        $or: [
                            {diaInicio: {$gte: eventoParam.start}},
                            {diaFin: {$lte: eventoParam.end}}]
                    },
                    populate: {
                        path: "reglas",
                    }
                });
                if (!usuario) {
                    return res
                        .status(404)
                        .send({error: "No existe un usuario con el correo " + usuariosParam[i]});
                }
                usuarios.push(usuario);
                eventos.concat(usuario.eventos);
                usuario.eventos.forEach((evento) => {
                    const diaFin = new Date(eventoParam.diaFin);
                    if (evento.frecuencia === "sinRepetir") {
                        let sizeEvento = evento.reglas.length;
                        for (let j = 0; j < sizeEvento; j++) {
                            const regla = evento.reglas[j];
                            let diaIterador = new Date(regla.horaInicio);
                            let diaIteradorFin = new Date(regla.horaFin);
                            eventos.push({start: diaIterador, end: diaIteradorFin});
                        }
                    } else if (evento.frecuencia === "semanal") {
                        let sizeEvento = evento.reglas.length;
                        for (let j = 0; j < sizeEvento; j++) {
                            const regla = evento.reglas[j];
                            let diaIterador = new Date(regla.horaInicio);
                            let diaIteradorFin = new Date(regla.horaFin);
                            diaIterador.setDate(diaIterador.getDate() + regla.unidad);
                            diaIteradorFin.setDate(diaIteradorFin.getDate() + regla.unidad);
                            while ((diaFin > diaIterador) && (evento.diaFin > diaIterador)) {
                                eventos.push({start: new Date(diaIterador), end: new Date(diaIteradorFin)});
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
                            while ((diaFin > diaIterador) && (evento.diaFin > diaIterador)) {
                                eventos.push({start: new Date(diaIterador), end: new Date(diaIteradorFin)});
                                diaIterador.setMonth(diaIterador.getMonth() + 1);
                                diaIteradorFin.setMonth(diaIteradorFin.getMonth() + 1);
                            }
                        }
                    }

                });
            }
            size = eventoParam.reglas.length;
            const diaFin = new Date(eventoParam.diaFin);
            let eventosSize = eventos.length;
            for (let i = 0; i < size; i++) {
                const regla = eventoParam.reglas[i];
                for (let j = 0; j < eventosSize; j++) {
                    if (eventoParam.frecuencia === "sinRepetir") {
                        const reglaInicio = new Date(regla.horaInicio);
                        const reglaFin = new Date(regla.horaFin);
                        if (reglaFin <= eventos[j].end && reglaFin >= eventos[j].start) {
                            return res
                                .status(500)
                                .send({error: "Existe un conflicto de horario"});
                        } else if (reglaInicio <= eventos[j].end && reglaInicio >= eventos[j].start) {
                            return res
                                .status(500)
                                .send({error: "Existe un conflicto de horario"});
                        }
                    } else if (eventoParam.frecuencia === "semanal") {
                        const reglaInicio = new Date(regla.horaInicio);
                        const reglaFin = new Date(regla.horaFin);
                        reglaInicio.setDate(reglaInicio.getDate() + regla.unidad);
                        reglaFin.setDate(reglaFin.getDate() + regla.unidad);
                        while (reglaInicio <= diaFin) {
                            if (reglaFin <= eventos[j].end && reglaFin >= eventos[j].start) {
                                return res
                                    .status(500)
                                    .send({error: "Existe un conflicto de horario"});
                            } else if (reglaInicio <= eventos[j].end && reglaInicio >= eventos[j].start) {
                                return res
                                    .status(500)
                                    .send({error: "Existe un conflicto de horario"});
                            }
                            reglaInicio.setDate(reglaInicio.getDate() + 7);
                            reglaFin.setDate(reglaFin.getDate() + 7);
                        }
                    } else if (eventoParam.frecuencia === "mensual") {
                        const reglaInicio = new Date(regla.horaInicio);
                        const reglaFin = new Date(regla.horaFin);
                        reglaInicio.setDate(reglaInicio.getDate() + regla.unidad);
                        reglaFin.setDate(reglaFin.getDate() + regla.unidad);
                        while (reglaInicio <= diaFin) {
                            if (reglaFin <= eventos[j].end && reglaFin >= eventos[j].start) {
                                return res
                                    .status(500)
                                    .send({error: "Existe un conflicto de horario"});
                            } else if (reglaInicio <= eventos[j].end && reglaInicio >= eventos[j].start) {
                                return res
                                    .status(500)
                                    .send({error: "Existe un conflicto de horario"});
                            }
                            reglaInicio.setMonth(reglaInicio.getMonth() + 1);
                            reglaFin.setMonth(reglaFin.getMonth() + 1);
                        }
                    }
                }
                res.status(200).send({mensaje:"No existen conflictos de horario para este evento"})
            }
        } catch
            (error) {
            return res.status(400).send({error: error});
        }
    }
);

module.exports = router;