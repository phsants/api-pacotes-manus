const express = require("express");
const { autenticarToken } = require("../middlewares/authMiddleware");
const {
  getPesquisas,
  getPesquisaDetalhe,
  configurarAgendamento,
  rodarPesquisa,
} = require("../controllers/azulController");

const router = express.Router();

router.get("/pesquisas", autenticarToken, getPesquisas);
router.get("/pesquisa/:id", autenticarToken, getPesquisaDetalhe);
router.post("/pesquisa/:id/agendamento", autenticarToken, configurarAgendamento);
router.post("/pesquisa/:id/run", autenticarToken, rodarPesquisa);

module.exports = router;
