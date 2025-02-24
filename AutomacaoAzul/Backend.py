from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'chave_secreta'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://usuario:senha@localhost:5435/pacotesViagens'
db = SQLAlchemy(app)


# Modelo de Usuário
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)


# Modelo de Pesquisa
class Pesquisa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    destino = db.Column(db.String(100), nullable=False)
    data_inicio = db.Column(db.String(10), nullable=False)
    data_fim = db.Column(db.String(10), nullable=False)
    orcamento = db.Column(db.Float, nullable=False)
    pessoas = db.Column(db.Integer, nullable=False)


@app.route('/')
def home():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    usuario = Usuario.query.filter_by(username=username).first()

    if usuario and check_password_hash(usuario.password, password):
        session['usuario_id'] = usuario.id
        return redirect(url_for('pesquisa'))
    return 'Login inválido'


@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        novo_usuario = Usuario(username=username, password=password)
        db.session.add(novo_usuario)
        db.session.commit()
        return redirect(url_for('home'))
    return render_template('cadastro.html')


@app.route('/pesquisa', methods=['GET', 'POST'])
def pesquisa():
    if 'usuario_id' not in session:
        return redirect(url_for('home'))

    if request.method == 'POST':
        destino = request.form['destino']
        data_inicio = request.form['data_inicio']
        data_fim = request.form['data_fim']
        orcamento = request.form['orcamento']
        pessoas = request.form['pessoas']
        nova_pesquisa = Pesquisa(usuario_id=session['usuario_id'], destino=destino, data_inicio=data_inicio,
                                 data_fim=data_fim, orcamento=float(orcamento), pessoas=int(pessoas))
        db.session.add(nova_pesquisa)
        db.session.commit()
        return 'Pesquisa salva com sucesso!'

    return render_template('pesquisa.html')

@app.route('/logout')
def logout():
    session.pop('usuario_id', None)
    return redirect(url_for('home'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
