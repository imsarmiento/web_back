const express = require("express");
const Evento = require("../models/evento-model");
const Regla = require("../models/regla-model")
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
    } catch (error) {
        res.status(500).send(error);
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
        const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!evento) {
            return res.status(404).send("No hubo coincidencia de evento");
        }
        return res.send(evento);
    } catch (error) {
        return res.status(400).send(error);
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
        return res.status(500).send(error);
    }
});

router.get("/:id/reglas", async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id).populate("reglas");
        if (!evento) {
            return res.status(404).send("No hubo coincidencia de evento");
        }
        return res.status(200).send(evento);
    } catch (error) {
        res.status(500).send();
    }
});

router.patch("/:id/reglas/:idRegla", async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).send("No hubo coincidencia de evento");
        }
        console.log(evento);
        const regla = await Regla.findById(req.params.idRegla);
        if (!regla) {
            return res.status(404).send("No hubo coincidencia de regla");
        }
        console.log(regla);
        evento.reglas.push(regla);
        evento.save();
        return res.send(evento);
    } catch (error) {
        console.log(error)
        return res.status(400).send(error);
    }
});


module.exports = router;