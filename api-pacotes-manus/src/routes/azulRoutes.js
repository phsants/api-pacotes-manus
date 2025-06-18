const express = require("express");
const { autenticarToken } = require("../middlewares/authMiddleware");
const {
  getPesquisas,
  getPesquisaDetalhe,
  configurarAgendamento,
  rodarPesquisa,
  salvarPesquisa,
  excluirPesquisa,
  atualizarPesquisa,
} = require("../controllers/azulController");

const router = express.Router();

router.get("/pesquisas", autenticarToken, getPesquisas);
router.get("/pesquisa/:id", autenticarToken, getPesquisaDetalhe);
router.post("/pesquisa/:id/agendamento", autenticarToken, configurarAgendamento);
router.post("/pesquisa/:id/run", autenticarToken, rodarPesquisa);
router.post("/pesquisas", autenticarToken, salvarPesquisa);
router.delete("/pesquisa/:id", autenticarToken, excluirPesquisa);
router.put('/pesquisa/:id', autenticarToken, atualizarPesquisa);

module.exports = router;
