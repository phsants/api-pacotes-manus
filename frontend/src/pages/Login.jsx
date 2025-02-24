import React from "react";

function Login() {
  return (
    <div style={styles.container}>
      {/* Área do Login */}
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Login</h2>
        <input type="text" placeholder="Usuário" style={styles.input} />
        <input type="password" placeholder="Senha" style={styles.input} />
        <button style={styles.button}>Entrar</button>
      </div>

      {/* Área da Imagem */}
      <div style={styles.imageContainer}>
        <img src="/images/logograndeVerde.jpeg" alt="Viagem" style={styles.image} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    width: "100vw",
    height: "100vh",
  },
  loginBox: {
    width: "30%", // Ocupa metade da tela
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    backgroundColor: "#fff",
    boxShadow: "4px 0 10px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  input: {
    width: "80%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "80%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "18px",
    cursor: "pointer",
  },
  imageContainer: {
    width: "70%", // A outra metade da tela
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // Ajusta a imagem para preencher o espaço
  },
};

export default Login;
