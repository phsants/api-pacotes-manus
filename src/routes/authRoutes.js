const express = require("express");
const { cadastrarUsuario, loginUsuario } = require("../controllers/authController");

const router = express.Router();

router.post("/cadastro", cadastrarUsuario);
router.post("/login", loginUsuario);

module.exports = router;
