const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
    backgroundImage: "url('/images/fundoMapa.jpg')", // Caminho da imagem
    backgroundSize: "cover", // Cobrir toda a tela
    backgroundPosition: "center", // Centralizar a imagem
    backgroundRepeat: "no-repeat", // Evitar repetição
  },
  formContainer: {
    width: "90%",
    maxWidth: "1200px",
    padding: "40px",
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Fundo branco semi-transparente
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    overflowY: "auto",
    maxHeight: "90vh",
  },
  title: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
  },
  fieldGroup: {
    width: "100%", // Largura dos campos
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "400",
    marginBottom: "5px",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px", // Espaçamento entre o input e o botão
    marginBottom: "10px", // Espaçamento entre os grupos de input
    width: "100%",
  },
  input: {
    flex: 1, // O input ocupa o espaço restante
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  calendario: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)", // 7 colunas (dias da semana)
    gap: "5px",
  },
  diaButton: {
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "center",
    backgroundColor: "#e3f2fd", // Azul claro
    color: "#333", // Cor do texto
    transition: "background-color 0.3s, color 0.3s", // Transição suave
  },
  toggleButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "10px", // Espaçamento abaixo do botão
    fontSize: "14px",
    width: "fit-content", // Ajusta o tamanho do botão ao conteúdo
  },
  checkboxContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 3 colunas
    gap: "10px", // Espaçamento entre os itens
  },
  checkboxItem: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  checkboxInput: {
    marginRight: "8px",
    cursor: "pointer",
    width: "16px",
    height: "16px",
  },
  checkboxLabel: {
    fontSize: "14px",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flexShrink: 0, // Impede que o botão diminua de tamanho
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    width: "100%", // Botão ocupa toda a largura
  },
};

const selectPlaceholderStyle = {
  color: "#999", // Cor mais clara para o placeholder
};

export default styles;