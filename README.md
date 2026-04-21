
# 📱 AlugApp — Gerenciamento de Aluguéis

Aplicativo construído com [React Native](https://reactnative.dev/) e [Expo](https://expo.dev/) para gerenciamento de imóveis, inquilinos, contratos e pagamentos. Ideal para proprietários e administradores de imóveis.

---

## 🚀 Funcionalidades implementadas

- Login com autenticação via `AsyncStorage`
- Usuário padrão: **admin / admin**
- Cadastro e listagem de:
  - Inquilinos
  - Usuários
- Tela principal com navegação em grade (HomeScreen)
- Cadastro de contratos, pagamentos, histórico
- Integração com inteligência artificial (DashboardIA)
- Compatível com **Web, Android e iOS**

---

## � Controle de Acesso (RBAC)

O sistema implementa Role-Based Access Control (RBAC) com duas roles principais:

### Roles Disponíveis

- **admin**: Acesso total ao sistema
  - Gerenciar imóveis, contratos, pagamentos e usuários
  - Visualizar e editar todas as telas
  - Acesso irrestrito

- **usuario**: Acesso restrito
  - Acesso às telas: Configurações, Ajuda, Meu Contrato, Meus Pagamentos e Histórico
  - Pode visualizar apenas informações relacionadas ao seu próprio contrato
  - Não pode acessar dados de outros usuários
  - Telas somente-leitura (sem edição)

### Implementação

#### Frontend
- **Estrutura de Roles**: Definida em `utils/permissions.js`
- **Proteção de Rotas**: Implementada em `AppNavigator.js` com verificação de role
- **Telas para Usuário**: 
  - `MeuContratoScreen.js` - Visualização somente-leitura do contrato do usuário
  - `MeusPagamentosScreen.js` - Histórico de pagamentos com status e resumo
- **Contexto de Autenticação**: `AuthContext.js` gerencia role do usuário
- **Funções de Banco**: `db.js` com novas funções:
  - `getContratosByUserId(uid)` - Busca contratos específicos do usuário
  - `getPagamentosByContratoId(contratoId)` - Busca pagamentos de um contrato

#### Backend (Firebase)
- **Regras de Segurança**: `firestore.rules` protege coleções no Firestore
- **Validação de Acesso**: Verifica role e ownership dos dados
- **Proteção de Dados**: Usuários só acessam seus próprios contratos/pagamentos

### Como Usar

1. **Definir Role no Cadastro**:
   ```javascript
   await db.saveUsuario({ email: 'user@example.com', role: 'usuario' });
   ```

2. **Verificar Permissões**:
   ```javascript
   import { hasPermission } from '../utils/permissions';
   
   if (hasPermission(userRole, 'canManageUsers')) {
     // Executar ação
   }
   ```

3. **Proteger Componentes**:
   ```javascript
   import { requirePermission } from '../utils/permissions';
   
   const ProtectedComponent = requirePermission('canManageUsers')(MyComponent);
   ```

4. **Regras Firestore**:
   - Deploy as regras: `firebase deploy --only firestore:rules`
   - As regras garantem que usuários não acessem dados de outros

---

## �🛠️ Tecnologias utilizadas

- [Expo](https://expo.dev/)
- React Native
- React Navigation
- Banco de dados local (SQLite) -> migração futura para firebase
- [Expo Vector Icons](https://icons.expo.fyi/)

---

## 🧪 Como rodar no navegador (Web)

### Pré-requisitos

- Node.js
- npm ou yarn
- Git
- Expo CLI (opcional)

### Instale as dependências

```bash
npm install
```

### Rode o projeto no navegador

```bash
npm start
ou
npx expo start -c --web
```

Depois de iniciado, pressione **`w`** para abrir no navegador.  
Você também pode escanear o QR Code no celular usando o app **Expo Go**.

---

## 📁 Estrutura do projeto

```bash
screens/
├── LoginScreen.js
├── HomeScreen.js
├── DashboardIA.js
├── CadastroInquilinoScreen.js
├── ListaInquilinosScreen.js
├── CadastroUsuarioScreen.js
├── ListaUsuariosScreen.js
├── ContratoScreen.js
├── PagamentosScreen.js
├── HistoricoScreen.js
├── ConfiguracoesScreen.js
└── AjudaScreen.js

db/
└── (opcional, se for usar SQLite futuramente)

App.js          # Ponto de entrada do app
```

---

## 👤 Usuário padrão

- **Login:** `admin`
- **Senha:** `admin`

Usuários adicionais podem ser cadastrados via tela "Cadastro de Usuário".

---

## 🧼 Limpar cache (se der erro)

```bash
npx expo start -c --web
```

---

## 📚 Saiba mais

- [Documentação Expo](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/docs/getting-started)

---

Feito com 💙 por [Jean Ferreira and Yuri Demetrio Ferreira]
