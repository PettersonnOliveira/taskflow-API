# TaskFlow Frontend

Frontend simples e estético para a API TaskFlow.

## Como usar

### 1. Iniciar a API Spring Boot

Certifique-se de que a API está rodando em `http://localhost:8080`.

Você pode iniciar a API com:
```bash
mvn spring-boot:run
```

### 2. Configurar variáveis de ambiente

Certifique-se de que as seguintes variáveis de ambiente estão configuradas:
- `MINHA_SENHA` - Senha do MySQL
- `JWT_SECRET` - Chave secreta para geração de tokens JWT

### 3. Abrir o Frontend

Abra o arquivo `index.html` diretamente no navegador ou use um servidor local simples:

```bash
# Python 3
python -m http.server 8000

# Node.js (com http-server)
npx http-server -p 8000
```

Acesse: `http://localhost:8000`

## Funcionalidades

### Autenticação
- Registro de novos usuários
- Login com email e senha
- Gerenciamento de sessão com JWT

### Gerenciamento de Tarefas
- Criar novas tarefas
- Listar todas as tarefas
- Filtrar tarefas por status (Pendente, Em Progresso, Concluída)
- Editar tarefas (título, descrição, status)
- Excluir tarefas

## Estrutura

- `index.html` - Página de login/registro
- `dashboard.html` - Dashboard principal
- `style.css` - Estilos com design moderno
- `script.js` - Lógica JavaScript e integração com a API

## Notas

- O frontend usa autenticação JWT armazenada no localStorage
- A API foi configurada com CORS para permitir requisições do frontend
- O design é responsivo e funciona em dispositivos móveis
