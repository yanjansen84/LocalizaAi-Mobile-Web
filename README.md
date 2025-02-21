# LocalizaAi 🗺️

LocalizaAi é uma aplicação web moderna desenvolvida com React e TypeScript que permite aos usuários encontrar e gerenciar eventos em um mapa interativo.

## 🚀 Tecnologias

Este projeto é construído com as seguintes tecnologias:

- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - React Router DOM
  - Google Maps API
  - React DatePicker

- **Backend:**
  - Supabase (Banco de dados e Autenticação)

## 📋 Funcionalidades

- Visualização de eventos em um mapa interativo
- Sistema de autenticação de usuários
- Cadastro e gerenciamento de eventos
- Sistema de compra de ingressos
- Avaliações de eventos
- Interface responsiva e moderna

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/yanjansen84/LocalizaAi.git
```

2. Instale as dependências:
```bash
cd LocalizaAi
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_GOOGLE_MAPS_API_KEY=sua_chave_da_api_do_google_maps
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🗄️ Banco de Dados

O projeto utiliza Supabase como banco de dados. Para configurar o banco de dados:

1. Execute as migrações:
```bash
npm run migrate
```

2. Para criar novas migrações:
```bash
npm run migrate:new nome_da_migracao
```

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Por favor, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- [@yanjansen84](https://github.com/yanjansen84)
