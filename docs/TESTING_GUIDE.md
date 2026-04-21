# 🧪 Guia de Testes - Sistema RBAC do AlugApp

Este documento contém um guia passo a passo para testar todo o sistema de controle de acesso (RBAC).

---

## 📋 Checklist de Testes

### Fase 1: Setup Inicial

- [ ] Iniciar a aplicação
- [ ] Confirmar que a tela de login aparece
- [ ] Fazer login com credenciais admin (ou criar admin)

### Fase 2: Testes como Admin

#### 2.1 Navegação e Permissões

- [ ] Login como admin funciona
- [ ] Dashboard (Home) exibe todas as opções
- [ ] Consegue acessar:
  - [ ] Cadastro de Usuário
  - [ ] Lista de Usuários
  - [ ] Cadastro de Inquilino
  - [ ] Lista de Inquilinos
  - [ ] Cadastro de Imóvel
  - [ ] Lista de Imóveis
  - [ ] Cadastro de Contrato
  - [ ] Lista de Contratos
  - [ ] Pagamentos (admin)
  - [ ] Histórico
  - [ ] Configurações
  - [ ] Ajuda

#### 2.2 Criar Dados de Teste

1. **Criar um novo usuário com role 'usuario'**:
   - [ ] Acesse "Cadastro de Usuário"
   - [ ] Preencha:
     - Nome: "João Silva"
     - Email: "joao@alugapp.com"
     - Senha: "senha123"
   - [ ] Sistema define role como 'usuario'
   - [ ] Usuário criado com sucesso ✓

2. **Criar um inquilino**:
   - [ ] Acesse "Cadastro de Inquilino"
   - [ ] Preencha:
     - Nome: "João Silva"
     - CPF: "123.456.789-00"
     - Email: "joao@alugapp.com"
     - Telefone: "(11) 98765-4321"
   - [ ] Salve com sucesso ✓

3. **Criar um imóvel**:
   - [ ] Acesse "Cadastro de Imóvel"
   - [ ] Preencha:
     - Endereço: "Rua A, 123, Apto 101"
     - Tipo: "Apartamento"
     - Andar: "1º"
   - [ ] Salve com sucesso ✓

4. **Criar um contrato vinculado ao usuário**:
   - [ ] Acesse "Cadastro de Contrato"
   - [ ] Preencha:
     - Inquilino: "João Silva"
     - Imóvel: "Rua A, 123, Apto 101"
     - Data Início: "01/01/2024"
     - Data Fim: "01/01/2025"
     - Valor: "1500"
   - [ ] ⭐ **Importante**: Deve vincular o contrato ao user.uid do usuário
   - [ ] Salve com sucesso ✓

5. **Registrar pagamentos**:
   - [ ] Acesse "Pagamentos"
   - [ ] Selecione o contrato criado
   - [ ] Registre 3 pagamentos:
     - Pagamento 1: Status "Pago" (Fevereiro)
     - Pagamento 2: Status "Pendente" (Março)
     - Pagamento 3: Status "Atrasado" (Abril)
   - [ ] Todos salvos com sucesso ✓

#### 2.3 Verificar Dados no Firestore (Optional)

- [ ] Abra Firebase Console
- [ ] Vá para Cloud Firestore
- [ ] Verifique:
  - [ ] `/usuarios/{uid}` tem `role: 'usuario'`
  - [ ] `/contratos` tem registro com `userId` do usuário criado
  - [ ] `/pagamentos` tem 3 registros com `contract_id` correto

### Fase 3: Testes como Usuário

#### 3.1 Logout e Login como Usuário

- [ ] Clique em Logout (se houver opção) ou faça logout via Firestore
- [ ] Login com credenciais do novo usuário:
  - Email: "joao@alugapp.com"
  - Senha: "senha123"
- [ ] Login funciona ✓
- [ ] Dashboard mostra apenas as opções permitidas

#### 3.2 Verificar Menu Restrito

- [ ] Confirmar que o menu mostra APENAS:
  - [ ] Home
  - [ ] Meu Contrato (novo)
  - [ ] Meus Pagamentos (novo)
  - [ ] Histórico
  - [ ] Configurações
  - [ ] Ajuda

- [ ] Confirmar que NÃO mostra:
  - [ ] Cadastro de Usuário ❌
  - [ ] Lista de Usuários ❌
  - [ ] Cadastro de Inquilino ❌
  - [ ] Lista de Inquilinos ❌
  - [ ] Cadastro de Imóvel ❌
  - [ ] Lista de Imóveis ❌
  - [ ] Cadastro de Contrato ❌
  - [ ] Lista de Contratos ❌
  - [ ] Pagamentos (admin) ❌

#### 3.3 Testar Tela "Meu Contrato"

- [ ] Acesse "Meu Contrato"
- [ ] Confirme que exibe:
  - [ ] ✓ Status: "Ativo"
  - [ ] ✓ ID do Contrato
  - [ ] ✓ Data de Início: "01/01/2024"
  - [ ] ✓ Data de Término: "01/01/2025"
  - [ ] ✓ Imóvel: "Rua A, 123, Apto 101"
  - [ ] ✓ Tipo de Imóvel: "Apartamento"
  - [ ] ✓ Nome do Inquilino: "João Silva"
  - [ ] ✓ Email do Inquilino: "joao@alugapp.com"
  - [ ] ✓ CPF do Inquilino: "123.456.789-00"
  - [ ] ✓ Valor do Aluguel: "R$ 1500,00"

- [ ] Confirme que:
  - [ ] ✓ Tela é SOMENTE LEITURA (sem botões de editar)
  - [ ] ✓ Há aviso: "Esta é uma visualização de seus dados"
  - [ ] ✓ Botão "Voltar para o Menu" funciona

#### 3.4 Testar Tela "Meus Pagamentos"

- [ ] Acesse "Meus Pagamentos"
- [ ] Confirme que exibe:
  - [ ] ✓ ID do Contrato
  - [ ] ✓ Imóvel: "Rua A, 123, Apto 101"
  - [ ] ✓ Valor mensal: "R$ 1500,00"

- [ ] Confirme Resumo de Totais:
  - [ ] ✓ Pago: "R$ 1500,00" (1 pagamento)
  - [ ] ✓ Pendente: "R$ 1500,00" (1 pagamento)
  - [ ] ✓ Atrasado: "R$ 1500,00" (1 pagamento)

- [ ] Confirme que exibe Lista de Pagamentos com:
  - [ ] ✓ Data (mais recentes primeiro)
  - [ ] ✓ Valor
  - [ ] ✓ Status (com cor visual)
  - [ ] ✓ Método de Pagamento
  - [ ] ✓ Observações (se houver)

- [ ] Confirme que:
  - [ ] ✓ Tela é SOMENTE LEITURA
  - [ ] ✓ Botão "Voltar para o Menu" funciona

#### 3.5 Testar Outras Telas de Usuário

- [ ] **Histórico**: Pode visualizar (vazio inicialmente) ✓
- [ ] **Configurações**: Pode acessar ✓
- [ ] **Ajuda**: Pode acessar ✓

#### 3.6 Tentar Fazer Edições

- [ ] Em "Meu Contrato": Verificar que NÃO há botões para editar ✓
- [ ] Em "Meus Pagamentos": Verificar que NÃO há botões para editar status ✓
- [ ] Confirmar que telas são TOTALMENTE SEM-EDIÇÃO ✓

### Fase 4: Testes de Segurança

#### 4.1 Tentar Forçar Acesso a Telas Restritas

1. **Tente navegar para "ListaUsuarios" (se possível via URL)**:
   - [ ] Deve ser bloqueado ou redirecionar para Home
   - [ ] Verificar console do browser para erros

2. **Tente navegar para "ListaImoveis"**:
   - [ ] Deve ser bloqueado

3. **Tente navegar para "Pagamentos" (tela admin)**:
   - [ ] Deve ser bloqueado

#### 4.2 Verificar que Não Vê Dados de Outros

1. **Como usuário, tente acessar:**
   - [ ] Dados de outro usuário (se houver forma de tentar)
   - [ ] Lista de todos os contratos
   - [ ] Lista de todos os pagamentos
   - [ ] Todos devem ser bloqueados/vazios

#### 4.3 Teste de Logout/Login

1. **Faça logout como usuário**:
   - [ ] Logout funciona
   - [ ] Retorna para tela de login

2. **Faça login novamente**:
   - [ ] Login funciona
   - [ ] Dados carregam corretamente
   - [ ] Nenhum erro

3. **Faça login como admin**:
   - [ ] Consegue acessar novamente todas as telas
   - [ ] Consegue ver o usuário criado e seus dados

### Fase 5: Testes de Dados

#### 5.1 Criar Segundo Usuário

1. **Como admin, crie outro usuário**:
   - [ ] Nome: "Maria Santos"
   - [ ] Email: "maria@alugapp.com"
   - [ ] Senha: "senha123"
   - [ ] Role: 'usuario'

2. **Crie contrato para Maria**:
   - [ ] Com um inquilino e imóvel DIFERENTES
   - [ ] Registre 2 pagamentos diferentes

3. **Como usuário João, verifique**:
   - [ ] Em "Meu Contrato" vê APENAS seu contrato
   - [ ] Em "Meus Pagamentos" vê APENAS seus pagamentos
   - [ ] NÃO vê dados de Maria

4. **Logout e login como Maria**:
   - [ ] Vê APENAS seu contrato
   - [ ] Vê APENAS seus pagamentos
   - [ ] NÃO vê dados de João

### Fase 6: Testes de Performance

- [ ] [ ] Telas carregam em menos de 2 segundos
- [ ] [ ] Sem erros de loading infinito
- [ ] [ ] Scroller funciona suavemente

### Fase 7: Testes Responsivos

- [ ] [ ] Acesse em desktop (web)
- [ ] [ ] Teste em celular (Android/iOS)
- [ ] [ ] Interfaces adaptam corretamente
- [ ] [ ] Botões funcionam em todos os tamanhos

---

## 🐛 Report de Bugs

### Formato para Relatar

```markdown
**Descrição do Bug**:
[Descreva o que não funciona]

**Como Reproduzir**:
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Esperado**:
[O que deveria acontecer]

**Real**:
[O que está acontecendo]

**Screenshots** (se aplicável):
[Attachar imagem]

**Environment**:
- Device: [Desktop/Mobile/Tablet]
- OS: [Android/iOS/Web]
- App Version: [x.x.x]
```

---

## ✅ Checklist Final

- [ ] Todos os testes passaram ✓
- [ ] Nenhum bug crítico encontrado
- [ ] Performance está aceitável
- [ ] UI é responsiva
- [ ] Documentação está atualizada
- [ ] Código está limpo e sem warnings

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os **logs do console** (F12)
2. Verifique o **Firestore** se os dados estão salvos
3. Verifique se **regras Firestore** estão deployadas
4. Tente **logout/login** novamente
5. Verifique se **role está correto** em `/usuarios/{uid}`
6. Verifique se **userId está preenchido** em `/contratos`

---

**Versão do Guia**: 1.0  
**Data**: 20 de abril de 2024
**Próxima Revisão**: Após deploy em produção
