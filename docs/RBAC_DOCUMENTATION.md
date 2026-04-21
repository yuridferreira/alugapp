# 🔐 Documentação do Sistema de RBAC - AlugApp

## Visão Geral

O AlugApp implementa um sistema robusto de **Role-Based Access Control (RBAC)** que garante a segurança dos dados dos usuários e protege o sistema contra acessos indevidos tanto no frontend quanto no backend.

---

## 1. Estrutura de Roles

### Admin (`admin`)
- **Descrição**: Administrador do sistema com acesso total
- **Permissões**:
  - Gerenciar usuários (criar, editar, deletar)
  - Gerenciar inquilinos e imóveis
  - Gerenciar contratos e pagamentos
  - Acessar todas as telas do sistema
  - Visualizar dados de qualquer usuário
  - Acessar Dashboard IA

### Usuário Final (`usuario`)
- **Descrição**: Inquilino/locatário com acesso restrito aos seus dados
- **Permissões**:
  - Visualizar apenas seu próprio contrato
  - Ver histórico de pagamentos do seu contrato
  - Acessar configurações da conta
  - Acessar seção de ajuda
  - Visualizar histórico de contratos encerrados
- **Limitações**:
  - Somente leitura (sem edição)
  - Não pode ver dados de outros usuários
  - Não pode gerenciar imóveis ou inquilinos
  - Não pode criar ou editar contratos

---

## 2. Telas do Sistema

### Para Usuários Finais

#### 🏠 Home
- Dashboard inicial com menu de navegação
- Exibe opções apenas acessíveis ao role do usuário

#### 📋 Meu Contrato (novo)
**Arquivo**: `screens/MeuContratoScreen.js`

**Funcionalidades**:
- Visualização somente-leitura do contrato do usuário
- Exibe:
  - Informações do contrato (ID, status, datas)
  - Dados do imóvel alugado (endereço, tipo)
  - Dados do inquilino/locatário (nome, email, CPF)
  - Valor do aluguel mensal
  - Status do contrato (Ativo/Encerrado)

**Fluxo de Dados**:
1. Usuário faz login
2. `AuthContext` carrega `user.uid` e `role`
3. `MeuContratoScreen` busca contratos do usuário: `db.getContratosByUserId(user.uid)`
4. Tela exibe primeiro contrato encontrado
5. Dados são protegidos no Firestore por regras de segurança

**Segurança**:
- Validação de role (`role === 'usuario'`)
- Filtro por `userId` no banco de dados
- Tela é somente-leitura
- Firestore rules impedem acesso não autorizado

#### 💳 Meus Pagamentos (novo)
**Arquivo**: `screens/MeusPagamentosScreen.js`

**Funcionalidades**:
- Histórico completo de pagamentos do usuário
- Exibe:
  - Resumo por status: Pago, Pendente, Atrasado
  - Total de cada categoria
  - Lista de pagamentos com:
    - Data do pagamento
    - Valor
    - Status (com cor visual)
    - Método de pagamento
    - Observações (se houver)
  - Informações do contrato associado
- Pagamentos ordenados por data (mais recentes primeiro)

**Fluxo de Dados**:
1. Usuário acessa tela de pagamentos
2. Tela busca contratos: `db.getContratosByUserId(user.uid)`
3. Para cada contrato, busca pagamentos: `db.getPagamentosByContratoId(contratoId)`
4. Exibe resumo e lista formatada

**Segurança**:
- Validação de role na abertura
- Filtro por contrato do usuário
- Tela é somente-leitura
- Firestore rules protegem dados

#### 📜 Histórico
- Lista de contratos finalizados
- Permite auditar histórico de aluguéis
- Somente-leitura

#### ⚙️ Configurações
- Ajustes pessoais da conta
- Dados do usuário

#### ❓ Ajuda
- Seção de suporte e dúvidas

---

## 3. Arquitetura Técnica

### Frontend

#### Estrutura de Permissões (`utils/permissions.js`)

```javascript
// Definições de roles e permissões
export const ROLES = {
  ADMIN: 'admin',
  USUARIO: 'usuario'
};

// Mapa de permissões por role
export const PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageProperties: true,
    canManageContracts: true,
    canManagePayments: true,
    canViewAllData: true,
    canAccessSettings: true,
    canAccessHelp: true,
    canViewOwnPayments: true,
    canViewOwnContract: true,
  },
  usuario: {
    canManageUsers: false,
    canManageProperties: false,
    canManageContracts: false,
    canManagePayments: false,
    canViewAllData: false,
    canAccessSettings: true,
    canAccessHelp: true,
    canViewOwnPayments: true,
    canViewOwnContract: true,
  }
};

// Telas acessíveis por role
export const ACCESSIBLE_SCREENS = {
  admin: ['Home', 'ListaUsuarios', 'ListaImoveis', ...],
  usuario: ['Home', 'MeuContrato', 'MeusPagamentos', 'Configuracoes', 'Ajuda']
};
```

#### Contexto de Autenticação (`context/AuthContext.js`)

- Gerencia autenticação do usuário
- Carrega `user`, `role` e `loading` do Firestore
- Disponibiliza via React Context para toda a app
- Atualiza automaticamente quando usuário faz logout/login

#### Proteção de Rotas (`navigation/AppNavigator.js`)

```javascript
// Renderiza diferentes telas baseado no role
{user && role === "usuario" && (
  <>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="MeuContrato" component={MeuContratoScreen} />
    <Stack.Screen name="MeusPagamentos" component={MeusPagamentosScreen} />
    <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
    <Stack.Screen name="Ajuda" component={AjudaScreen} />
  </>
)}

{user && role === "admin" && (
  <>
    {/* Todas as telas... */}
  </>
)}
```

#### Banco de Dados (`db/db.js`)

Novas funções de filtro:

```javascript
// Buscar contratos de um usuário específico
async getContratosByUserId(userId) {
  const q = query(contratosCollection, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Buscar pagamentos de um contrato
async getPagamentosByContratoId(contratoId) {
  const q = query(pagamentosCollection, where('contract_id', '==', contratoId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
```

### Backend (Firebase)

#### Regras de Firestore (`firestore.rules`)

```firestore
// Usuários: Admin pode ler todos, usuários podem ler apenas o seu próprio
match /usuarios/{userId} {
  allow read: if isAdmin() || isOwner(userId);
  allow write: if isAdmin() || (isOwner(userId) && request.resource.data.role == resource.data.role);
  allow create: if isAdmin();
  allow delete: if isAdmin();
}

// Contratos: Admin pode tudo, usuários podem ler apenas os seus
match /contratos/{contratoId} {
  allow read: if isAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
  allow write, create, delete: if isAdmin();
}

// Pagamentos: Mesmo padrão dos contratos
match /pagamentos/{pagamentoId} {
  allow read: if isAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
  allow write, create, delete: if isAdmin();
}
```

---

## 4. Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE LOGIN                           │
└─────────────────────────────────────────────────────────────┘

1. Usuário insere email + senha
   ↓
2. Firebase Auth valida credenciais
   ↓
3. User.uid retorna
   ↓
4. AuthContext lê documento /usuarios/{uid} no Firestore
   ↓
5. Extrai field 'role' do documento
   ↓
6. Atualiza AuthContext com { user, role, loading }
   ↓
7. AppNavigator renderiza telas baseado em role
   ↓
8. MeuContratoScreen filtra por user.uid
   ↓
9. Firestore rules garantem autorização
```

---

## 5. Integração de Dados

### Salvar Contrato com userId

```javascript
const novoContrato = {
  inquilino: 'João Silva',
  imovel: 'Apt 101',
  valor: 1500,
  userId: user.uid,  // Importante! Vincula contrato ao usuário
  dataInicio: '2024-01-01',
  dataTermino: '2025-01-01'
};

await db.saveContrato(novoContrato);
```

### Buscar Contratos de um Usuário

```javascript
// No MeuContratoScreen
const contratos = await db.getContratosByUserId(user.uid);

if (contratos.length > 0) {
  const meuContrato = contratos[0];
  // Exibir dados
}
```

### Buscar Pagamentos do Contrato

```javascript
// No MeusPagamentosScreen
const pagamentos = await db.getPagamentosByContratoId(contratoId);

// Filtrar por status
const pagos = pagamentos.filter(p => p.status === 'pago');
const pendentes = pagamentos.filter(p => p.status === 'pendente');
```

---

## 6. Segurança - Checklist

### Frontend
- ✅ Rotas protegidas no `AppNavigator.js`
- ✅ Validação de role em entrada de telas
- ✅ Filtragem de dados por `userId`
- ✅ Telas de usuário são somente-leitura
- ✅ Mensagens de acesso negado

### Backend
- ✅ Firestore rules validam role
- ✅ Usuários só leem dados où `userId == request.auth.uid`
- ✅ Apenas admin pode criar/editar contratos
- ✅ Usuários não podem alterar próprio `role`
- ✅ Queries filtram automaticamente por userId

### Dados
- ✅ Campos `userId` em contratos e pagamentos
- ✅ Indices no Firestore para queries rápidas
- ✅ Sem exposição de dados sensíveis

---

## 7. Testes Recomendados

### Como Testar como Admin
1. Login com credenciais admin
2. Navegar na tela "ListaUsuarios"
3. Criar novo usuário com role 'usuario'
4. Logout

### Como Testar como Usuário
1. Login com conta de usuário criada
2. Verificar que só pode acessar: Meu Contrato, Meus Pagamentos, Configurações, Ajuda
3. Acessar "Meu Contrato" - deve exibir apenas seu contrato
4. Acessar "Meus Pagamentos" - deve exibir apenas pagamentos de seu contrato
5. Tentar navegar diretamente para "ListaUsuarios" - deve ser bloqueado

### Testes de Segurança
1. Fazer login como usuário A
2. Tentar forçar navegação para "ListaImoveis" - não deve funcionar
3. Verificar no console se dados de outros usuários aparecem
4. Logout de A, login como usuário B
5. Nenhum dado de A deve ser visível

---

## 8. Troubleshooting

| Problema | Causa Possível | Solução |
|----------|----------------|---------|
| Tela "Meu Contrato" mostra "Sem contrato" | Usuário não tem contrato vinculado | Criar contrato no admin com `userId` |
| Usuário vê telas de admin | Role incorreto no Firestore | Atualizar role em /usuarios/{uid} para 'usuario' |
| Pagamentos não aparecem | `contract_id` não preenchido | Assegurar que `contract_id` está em pagamentos |
| Erro ao buscar contratos | Query filter incorreto | Verificar se `userId` existe no documento |
| Firestore rules negam acesso | Regras mal configuradas | Deploy: `firebase deploy --only firestore:rules` |

---

## 9. Próximas Melhorias

- [ ] Dois fatores de autenticação (2FA)
- [ ] Audit log de acessos
- [ ] Notificações de pagamentos próximos do vencimento
- [ ] Dashboard customizado por role
- [ ] Exportação de recibos (PDF)
- [ ] Integração com API de pagamento

---

**Versão**: 1.0
**Última atualização**: 20 de abril de 2024
**Responsável**: Desenvolvimento AlugApp
