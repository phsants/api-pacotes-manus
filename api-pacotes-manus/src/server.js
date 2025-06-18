const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const azulRoutes = require("./routes/azulRoutes");
const authRoutes = require("./routes/authRoutes");
const pesquisaRoutes = require("./routes/pesquisaRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/api", authRoutes);
app.use("/api", pesquisaRoutes);
app.use("/api", azulRoutes);

// Frontend (se houver)
//app.use(express.static(path.join(__dirname, "../dist")));
//app.get("*", (req, res) => {
//  res.sendFile(path.join(__dirname, "../dist/index.html"));
//});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
