const express = require("express");
const Regla = require("../models/regla-model");
const router = new express.Router();

/**
 * REGLA
 */

/**
 *  Devuelve todos las reglas con el id especificado
 */
router.get("/:id", async (req, res) => {
    try {
        const regla = await Regla.findById(req.params.id);
        if (!regla) {
            return res.status(404).send({error: "No hubo coincidencia de regla"});
        }
        return res.status(200).send(regla);
    } catch (error) {
        res.status(500).send({error: error});
    }
});

/**
 *  Devuelve todas las reglas
 */
router.get("/", async (req, res) => {
    try {
        const reglas = await Regla.find({});
        return res.send(reglas);
    } catch (error) {
        res.status(500).send({error: error});
    }
});

/**
 * Crea una regla
 */
router.post("/", async (req, resp) => {
    try {
        const regla = new Regla(req.body);
        await regla.save();
        return resp.status(201).send(regla);
    } catch (error) {
        resp.status(400).send({error: error});
    }
});

/**
 *  Modifica una regla con el id especificado
 */
router.patch("/:id", async (req, res) => {
    try {
        const regla = await Regla.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!regla) {
            return res.status(404).send({error: "No hubo coincidencia de regla"});
        }
        return res.send(regla);
    } catch (error) {
        return res.status(400).send({error: error});
    }
});

/**
 * Elimina una regla con el id especificado
 */
router.delete("/:id", async (req, res) => {
    try {
        const regla = await Regla.findByIdAndDelete(req.params.id);
        if (!regla) {
            return res.status(404).send({error: "No hubo coincidencia de regla"});
        }
        res.send(regla);
    } catch (error) {
        return res.status(500).send({error: error});
    }
});

module.exports = router;