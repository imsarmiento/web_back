const express = require("express");
const Evento = require("../models/evento-model");
const router = new express.Router();

router.get("/:id", async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).send("No hubo coincidencia de evento");
        }
        return res.status(200).send(evento);
    } catch (error) {
        res.status(500).send();
    }
});

router.get("", async (req, res) => {
    try {
        const eventos = await Evento.find({});
        return res.send(eventos);
    } catch (e) {
        res.status(500).send();
    }
});

router.post("", async (req, resp) => {
    try {
        const evento = new Evento(req.body);
        await evento.save();
        return resp.status(201).send(evento);
    } catch (error) {
        resp.status(400).send(error);
    }
});

router.patch("/:id", async (req, res) => {
    try {
        if (!Evento.fieldsNotAllowedUpdates(req.body)) {
            return res.status(400).send({error: "Actualizacion invalida"});
        }
        const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!evento) {
            return res.status(404).send("No hubo coincidencia de evento");
        }
        return res.send(evento);
    } catch (e) {
        return res.status(400).send(e);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const evento = await Evento.findByIdAndDelete(req.params.id);
        if (!evento) {
            return res.status(404).send("No hubo coincidencia de evento");
        }
        res.send(evento);
    } catch (error) {
        return res.status(500).send();
    }
});

module.exports = router;