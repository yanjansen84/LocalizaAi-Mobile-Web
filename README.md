# LocalizaAi 🗺️

LocalizaAi é uma aplicação web moderna desenvolvida com React e TypeScript que permite aos usuários encontrar e gerenciar eventos em um mapa interativo.

> ⚠️ **Aviso Legal**: Este é um projeto privado e proprietário. Todos os direitos reservados. O código fonte e a documentação são confidenciais e de propriedade exclusiva dos desenvolvedores do LocalizaAi.

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

## ⚙️ Ambiente de Desenvolvimento

Para configurar o ambiente de desenvolvimento:

1. Configure as variáveis de ambiente no arquivo `.env`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_GOOGLE_MAPS_API_KEY=sua_chave_da_api_do_google_maps
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🗄️ Banco de Dados

O projeto utiliza Supabase como banco de dados. Para gerenciar o banco de dados:

1. Execute as migrações:
```bash
npm run migrate
```

2. Para criar novas migrações:
```bash
npm run migrate:new nome_da_migracao
```

## 📝 Direitos Autorais

Copyright 2025 LocalizaAi. Todos os direitos reservados.

Este software é proprietário e confidencial. Nenhuma parte do código fonte deste software pode ser copiada, distribuída, modificada ou incorporada em outros softwares sem a autorização expressa por escrito dos proprietários do LocalizaAi.

## 👤 Desenvolvedor

- Yan Jansen
