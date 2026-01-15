# 🚀 Como Rodar o Projeto

Este guia assume que você já tem Docker, Python e Node.js instalados na sua máquina.

## 1. Banco de Dados (Docker)

Inicie o banco de dados e os serviços auxiliares:

```bash
docker-compose up -d
```

## 2. Backend (FastAPI)

### 2.1 Acesse a pasta do backend

```bash
cd backend
```

### 2.2 Configure o ambiente virtual

Crie e ative o ambiente virtual (se ainda não existir):

**Windows:**

- Se usar `uv`:
  ```bash
  uv sync
  ```

- Se usar `venv` padrão:
  ```bash
  python -m venv .venv
  .\.venv\Scripts\activate
  ```

**Linux/Mac:**

```bash
python -m venv .venv
source .venv/bin/activate
```

### 2.3 Instale as dependências

Instale as dependências (apenas na primeira vez):

```bash
pip install -r requirements.txt
```

Ou, se estiver usando `uv`:

```bash
uv sync
```

### 2.4 Inicie o servidor

```bash
python -m uvicorn app.main:app --reload
```

O Backend estará rodando em: [http://localhost:8000](http://localhost:8000)  
Documentação disponível em: [http://localhost:8000/docs](http://localhost:8000/docs)

## 3. Frontend (React/Vite)

Abra um segundo terminal e configure o frontend.

### 3.1 Acesse a pasta do frontend

```bash
cd frontend
```

### 3.2 Instale as dependências

Instale as dependências (apenas na primeira vez):

```bash
npm install
```

### 3.3 Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O Frontend estará rodando em: [http://localhost:5173](http://localhost:5173)