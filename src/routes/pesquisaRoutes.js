const express = require("express");
const { autenticarToken } = require("../middlewares/authMiddleware");
const { getCidades, getAeroportos, getVoos } = require("../controllers/pesquisasController");

const router = express.Router();

router.get("/cidades", autenticarToken, getCidades);
router.get("/aeroportos/:cidade_id", autenticarToken, getAeroportos);
router.get("/voos", autenticarToken, getVoos);

module.exports = router;
