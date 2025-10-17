# ========================================
# API BACKEND EM PYTHON COM FLASK
# ========================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

# ========================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ========================================

def init_db():
    """Inicializa o banco de dados SQLite"""
    conn = sqlite3.connect('eventos.db')
    cursor = conn.cursor()
    
    # Cria a tabela de eventos se não existir
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            data TEXT NOT NULL,
            local TEXT NOT NULL,
            descricao TEXT NOT NULL
        )
    ''')
    
    # Verifica se já existem dados
    cursor.execute('SELECT COUNT(*) FROM eventos')
    count = cursor.fetchone()[0]
    
    # Se não houver dados, insere dados iniciais
    if count == 0:
        dados_iniciais = [
            ('Semana de Tecnologia UEPB', '2024-11-20', 'Auditório Central', 'Evento sobre inovação e tecnologia'),
            ('Workshop de Programação', '2024-11-25', 'Laboratório de Informática', 'Aprenda a programar do zero')
        ]
        cursor.executemany(
            'INSERT INTO eventos (nome, data, local, descricao) VALUES (?, ?, ?, ?)',
            dados_iniciais
        )
    
    conn.commit()
    conn.close()

# ========================================
# ROTAS DA API (ENDPOINTS)
# ========================================

@app.route('/api/eventos', methods=['GET'])
def buscar_eventos():
    """READ - Busca todos os eventos"""
    conn = sqlite3.connect('eventos.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM eventos ORDER BY data')
    eventos = cursor.fetchall()
    
    conn.close()
    
    # Converte para formato JSON
    eventos_json = [
        {
            'id': evento[0],
            'nome': evento[1],
            'data': evento[2],
            'local': evento[3],
            'descricao': evento[4]
        }
        for evento in eventos
    ]
    
    return jsonify(eventos_json)

@app.route('/api/eventos', methods=['POST'])
def criar_evento():
    """CREATE - Cria um novo evento"""
    dados = request.json
    
    # Validação básica
    if not all(key in dados for key in ['nome', 'data', 'local', 'descricao']):
        return jsonify({'erro': 'Dados incompletos'}), 400
    
    conn = sqlite3.connect('eventos.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO eventos (nome, data, local, descricao) VALUES (?, ?, ?, ?)',
        (dados['nome'], dados['data'], dados['local'], dados['descricao'])
    )
    
    evento_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': evento_id,
        'nome': dados['nome'],
        'data': dados['data'],
        'local': dados['local'],
        'descricao': dados['descricao']
    }), 201

@app.route('/api/eventos/<int:id>', methods=['PUT'])
def atualizar_evento(id):
    """UPDATE - Atualiza um evento existente"""
    dados = request.json
    
    conn = sqlite3.connect('eventos.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE eventos SET nome=?, data=?, local=?, descricao=? WHERE id=?',
        (dados['nome'], dados['data'], dados['local'], dados['descricao'], id)
    )
    
    conn.commit()
    
    # Verifica se o evento foi encontrado
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'erro': 'Evento não encontrado'}), 404
    
    conn.close()
    
    return jsonify({
        'id': id,
        'nome': dados['nome'],
        'data': dados['data'],
        'local': dados['local'],
        'descricao': dados['descricao']
    })

@app.route('/api/eventos/<int:id>', methods=['DELETE'])
def deletar_evento(id):
    """DELETE - Remove um evento"""
    conn = sqlite3.connect('eventos.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM eventos WHERE id=?', (id,))
    
    conn.commit()
    
    # Verifica se o evento foi encontrado
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'erro': 'Evento não encontrado'}), 404
    
    conn.close()
    
    return jsonify({'mensagem': 'Evento deletado com sucesso'})

# ========================================
# INICIALIZAÇÃO DO SERVIDOR
# ========================================

if __name__ == '__main__':
    init_db()  # Inicializa o banco de dados
    print('🚀 Servidor rodando em http://localhost:5000')
    print('📊 Banco de dados: eventos.db')
    app.run(debug=True, port=5000)

