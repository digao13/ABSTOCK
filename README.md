# ABSTOCK

<p align="center">
  <strong>Gestão inteligente de estoque, compras e operação.</strong><br />
  Controle produtos, movimentações, tarefas e compras em um único sistema.
</p>

<p align="center">
  <a href="https://abstock.pages.dev">Abrir aplicação</a> ·
  <a href="https://erp-estoque-9effb.web.app">Firebase Hosting</a>
</p>

## Sobre o projeto

O ABSTOCK é um ERP web para operações que precisam acompanhar o estoque e o ciclo completo de compras com clareza, segurança e atualização em tempo real.

A aplicação foi construída para centralizar as rotinas de cadastro de produtos, entradas e saídas de estoque, solicitações de compra, realização e recebimento de compras, tarefas operacionais e relatórios gerenciais.

## Principais módulos

- **Dashboard:** indicadores operacionais, compras por status, tarefas por filial e produtos críticos.
- **Estoque:** cadastro de produtos, níveis mínimo/máximo, entradas, saídas e histórico de movimentações.
- **Compras:** solicitações, aprovação, realização, recebimento e acompanhamento de fornecedores.
- **Tarefas:** atividades por filial, data planejada, status de conclusão e baixa opcional de itens do estoque.
- **Filiais:** cadastro, edição, ativação e inativação sem apagar o histórico.
- **Relatórios:** filtros de tarefas e compras por status, filial, fornecedor e item.
- **Usuários:** perfis de acesso, ativação/inativação e controle de permissões.
- **Notificações internas:** avisos em tempo real enquanto o sistema estiver aberto.

## Tecnologia

- React 19
- Vite 8
- Material UI
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Cloudflare Pages
- EmailJS para comunicações configuradas

## Dados e segurança

Os dados operacionais ficam no Cloud Firestore, separados por coleções:

```text
usuarios/{uid}
produtos/{id}
movimentacoesEstoque/{id}
compras/{id}
solicitacoesCompra/{id}
tarefas/{id}
filiais/{id}
fornecedores/{id}
```

As regras do Firestore controlam o acesso por perfil. Administradores gerenciam usuários; gestores e administradores controlam o estoque; os demais perfis recebem somente as permissões necessárias para suas funções.

## Rodando localmente

### Pré-requisitos

- Node.js 20 ou superior
- npm
- Um projeto Firebase configurado

### Instalação

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto com as configurações do Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

Nunca publique o arquivo `.env` no GitHub.

### Desenvolvimento

```bash
npm run dev
```

### Verificação

```bash
npm run build
npm run lint
```

O lint pode apresentar avisos informativos do React, mas o build deve ser concluído sem erros.

## Publicação

Gere a versão de produção antes de publicar:

```bash
npm run build
```

Firebase Hosting:

```bash
firebase deploy --only hosting --project erp-estoque-9effb
```

Cloudflare Pages:

```bash
npm exec --yes wrangler@latest -- pages deploy dist --project-name abstock --branch main --commit-dirty=true
```

As duas hospedagens usam o mesmo Firestore, portanto os dados permanecem sincronizados.

## Notificações

O ABSTOCK possui notificações internas baseadas nas atualizações em tempo real do Firestore. Elas informam novas tarefas, solicitações e mudanças em compras enquanto o usuário está com a aplicação aberta.

A solução atual não usa Cloud Functions, plano Blaze ou cartão de cobrança.

## Contribuição

1. Crie uma branch para sua alteração.
2. Faça mudanças pequenas e testáveis.
3. Execute `npm run build` e `npm run lint`.
4. Abra um pull request descrevendo o que foi alterado.

## Licença

Projeto privado de uso interno.