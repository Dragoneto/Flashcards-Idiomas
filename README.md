## Flashcards Idiomas

Sistema de flashcards para aprendizado de idiomas com tradução automática e suporte a teclado coreano (Hangul).

O sistema integra três serviços distintos:
- **Backend (Flask):** API REST própria com autenticação JWT, gerenciamento de decks e cards.
- **MyMemory API:** Serviço externo de tradução automática — consumido a cada novo card criado.
- **Google Input Tools API:** Serviço externo do Google IME — converte romanização latina em caracteres Hangul em tempo real.
- **Frontend (React/Vite):** Interface web para criar, revisar e gerenciar flashcards, e acessar a ferramenta de conversão Hangul.

---

## Tecnologias Utilizadas

### Backend
- Python 3.11
- Flask — framework web
- Flask-JWT-Extended — autenticação com tokens JWT
- Flask-SQLAlchemy + SQLite — banco de dados
- Flask-CORS — suporte a requisições cross-origin
- Requests — consumo de APIs externas
- Gunicorn — servidor WSGI para produção

### Frontend
- React 18
- Vite — bundler e dev server
- React Router v6 — navegação SPA
- Axios — requisições HTTP

### Infraestrutura
- GitHub — versionamento
- Render.com — deploy do backend
- Vercel — deploy do frontend

---

## Endpoints da API

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

### Integração / Tradução
| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| POST | `/translate` | JWT | Traduz texto via MyMemory API |
| POST | `/translate/hangul` | JWT | Converte teclado latino → caracteres Hangul |

#### Exemplo `/translate/hangul`
```json
// Request
{ "text": "annyeong" }

// Response
{ "original": "annyeong", "hangul": "안녕" }
```

O endpoint delega a conversão à **Google Input Tools API** (`inputtools.google.com`), que interpreta a romanização fonética e retorna os caracteres Hangul compostos. Possui fallback local caso a API externa esteja indisponível.

---

## Fluxo de Integração

1. Usuário faz registro/login → recebe token JWT
2. Usuário cria um deck com o idioma destino (ex.: coreano)
3. Usuário cria um card com uma palavra em português
4. Backend chama a MyMemory API para obter a tradução
5. Card é salvo (palavra + tradução) no banco SQLite
6. Frontend exibe o flashcard (clique para revelar a tradução)
7. Opcionalmente: usuário usa a ferramenta Hangul para converter texto digitado no teclado latino em caracteres coreanos

---

## Como Executar Localmente

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
# API disponível em http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env       # ajuste VITE_API_URL se necessário
npm install
npm run dev
# App disponível em http://localhost:5173
```

---

## Deploy

### Backend — Render.com
1. Conecte o repositório no [Render.com](https://render.com)
2. Selecione o diretório raiz como `backend/`
3. O `render.yaml` já configura build e start commands
4. Adicione a variável de ambiente `JWT_SECRET_KEY` (ou deixe o Render gerar automaticamente)

### Frontend — Vercel
1. Conecte o repositório no [Vercel](https://vercel.com)
2. Selecione o diretório raiz como `frontend/`
3. Defina a variável de ambiente `VITE_API_URL` com a URL do backend no Render
4. O `vercel.json` já configura o rewrite para SPA

**Links de produção:**
- Backend: `https://flashcard-idiomas.onrender.com`
- Frontend: `https://flashcard-idiomas.vercel.app`

---

## Autor

**Davi Alencar Almeida**  
Análise e Desenvolvimento de Sistemas — UNIFOR  
[github.com/Dragoneto](https://github.com/Dragoneto)
