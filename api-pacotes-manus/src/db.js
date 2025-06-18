const sql = require("mssql");
require("dotenv").config();

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Para Azure SQL Database
    trustServerCertificate: false, // Para Azure SQL Database
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Pool de conexões
let pool;

const getPool = async () => {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log("Conectado ao Azure SQL Database");
    } catch (err) {
      console.error("Erro ao conectar ao banco de dados:", err);
      throw err;
    }
  }
  return pool;
};

// Função para executar queries (compatibilidade com código existente)
const query = async (text, params = []) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    
    // Adiciona parâmetros à request
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        request.input(`param${index + 1}`, param);
      });
    }
    
    // Converte placeholders $1, $2, etc. para @param1, @param2, etc.
    let convertedText = text;
    for (let i = 0; i < params.length; i++) {
      convertedText = convertedText.replace(new RegExp(`\\$${i + 1}`, 'g'), `@param${i + 1}`);
    }
    
    const result = await request.query(convertedText);
    
    // Retorna no formato compatível com pg
    return {
      rows: result.recordset || [],
      rowCount: result.rowsAffected ? result.rowsAffected[0] : 0
    };
  } catch (err) {
    console.error("Erro na query:", err);
    throw err;
  }
};

// Função para fechar conexões
const end = async () => {
  if (pool) {
    await pool.close();
    pool = null;
  }
};

module.exports = {
  query,
  end,
  getPool,
  sql // Exporta o objeto sql para uso direto quando necessário
};

