const express = require("express");
const { Pool } = require("pg");
const cors = require("cors"); // Importe o cors
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Configuração do PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5435,
});

// Habilitar CORS
app.use(cors());

// Middleware para permitir JSON no corpo das requisições
app.use(express.json());

// Rota para buscar cidades
app.get("/api/cidades", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nome FROM cidades");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar cidades");
  }
});

// Rota para buscar aeroportos de uma cidade
app.get("/api/aeroportos/:cidade_id", async (req, res) => {
  const { cidade_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT codigo, nome FROM aeroportos WHERE cidade_id = $1",
      [cidade_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar aeroportos");
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});