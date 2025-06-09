const express = require("express");
const { autenticarToken } = require("../middlewares/authMiddleware");
const { getCidades, getAeroportos, getHoteis, getVoosByExecucao } = require("../controllers/pesquisasController");

const router = express.Router();

router.get("/cidades", autenticarToken, getCidades);
router.get("/aeroportos/:cidade_id", autenticarToken, getAeroportos);
router.get("/hoteis",  autenticarToken, getHoteis);
router.get("/voos/:id_execucao", autenticarToken, getVoosByExecucao);

module.exports = router;
