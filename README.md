O sistema é composto por dois serviços principais:
- **Backend (Flask):** API REST responsável pela autenticação de usuários,
  gerenciamento de decks e cards, e integração com a API de tradução.
- **MyMemory API:** Serviço externo gratuito de tradução automática,
  consumido pelo backend a cada novo card criado.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- Python 3.11
- Flask — framework web
- Flask-JWT-Extended — autenticação com tokens JWT
- SQLite — banco de dados
- Requests — consumo da API externa

### Frontend
- React
- Axios — requisições HTTP

### Infraestrutura
- GitHub — versionamento e colaboração
- Render.com — deploy do backend
- Vercel — deploy do frontend

---

## 🔗 Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastro de usuário |
| POST | `/auth/login` | Login e geração do token JWT |

### Decks
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/decks` | Listar decks do usuário |
| POST | `/decks` | Criar novo deck |
| DELETE | `/decks/<id>` | Deletar deck |

### Cards
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/decks/<id>/cards` | Listar cards de um deck |
| POST | `/decks/<id>/cards` | Criar card com tradução automática |
| DELETE | `/cards/<id>` | Deletar card |

### Integração
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/translate` | Traduz texto via MyMemory API |

---

## 🔄 Fluxo de Integração

1. Usuário faz login → recebe token JWT
2. Usuário cria um card com uma palavra
3. Backend chama a MyMemory API com a palavra
4. MyMemory retorna a tradução
5. Backend salva o card (palavra + tradução) no banco
6. Frontend exibe o flashcard pronto

---

## ▶️ Como Executar Localmente

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deploy

- Backend: `https://flashcard-idiomas.onrender.com`
- Frontend: `https://flashcard-idiomas.vercel.app`

> Links serão atualizados após o deploy final.

---

## 👤 Autor

**Davi Alencar Almeida**  
Análise e Desenvolvimento de Sistemas — UNIFOR  
(https://github.com/Dragoneto)