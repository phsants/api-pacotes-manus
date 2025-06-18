const pool = require("./src/db");

async function testarConexao() {
  try {
    console.log("Testando conexão com Azure SQL Database...");
    
    // Testa a conexão básica
    const result = await pool.query("SELECT 1 as teste");
    console.log("✅ Conexão estabelecida com sucesso!");
    console.log("Resultado do teste:", result.rows);
    
    // Testa se consegue listar tabelas
    try {
      const tabelas = await pool.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);
      console.log("✅ Tabelas encontradas no banco:");
      tabelas.rows.forEach(tabela => {
        console.log(`  - ${tabela.TABLE_NAME}`);
      });
    } catch (err) {
      console.log("⚠️  Erro ao listar tabelas (normal se banco estiver vazio):", err.message);
    }
    
  } catch (error) {
    console.error("❌ Erro na conexão:", error.message);
    console.error("Detalhes:", error);
  } finally {
    await pool.end();
    console.log("Conexão fechada.");
  }
}

testarConexao();

