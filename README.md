
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

## 🛠️ Tecnologias utilizadas

- [Expo](https://expo.dev/)
- React Native
- React Navigation
- AsyncStorage (`@react-native-async-storage/async-storage`)
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

Feito com 💙 por [Jean Ferreira]
