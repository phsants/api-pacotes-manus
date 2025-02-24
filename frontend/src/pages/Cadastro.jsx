export function Cadastro() {
  return (
    <div className="container">
      <div className="card">
        <h2>Cadastro</h2>
        <input type="text" placeholder="Usuário" className="input" />
        <input type="password" placeholder="Senha" className="input" />
        <button className="button">Cadastrar</button>
      </div>
    </div>
  );
}

export default Cadastro;