// 📋 GUIA RÁPIDO - Como Usar o Novo Sistema de Roles e Telas de Usuário
// Este arquivo contém exemplos práticos de implementação

// ==============================================================================
// 1. CADASTRANDO UM USUÁRIO COM ROLE DE USUARIO
// ==============================================================================

import { db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Exemplo: Cadastrar um novo usuário através do formulário
export async function cadastrarUsuarioComRole(nome, email, senha, role = 'usuario') {
  try {
    // 1. Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = userCredential.user.uid;

    // 2. Criar documento de usuário no Firestore com role e userId
    await setDoc(doc(db, 'usuarios', uid), {
      nome: nome,
      email: email,
      role: role,  // 'admin' ou 'usuario'
      criadoEm: new Date(),
      userId: uid  // Adicionar userId para referência
    });

    return { success: true, uid, message: 'Usuário criado com sucesso!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==============================================================================
// 2. CADASTRANDO UM CONTRATO COM USERID (IMPORTANTE!)
// ==============================================================================

import { db } from '../db/db';

// Exemplo: Cadastrar um contrato vinculado a um usuário
export async function criarContratoComUsuario(usuarioEmail, inquilinoId, imovelId, valor, dataInicio, dataTermino) {
  try {
    // 1. Buscar o UUID do usuário pelo email
    const usuario = await db.getUsuarioByEmail(usuarioEmail);
    if (!usuario) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // 2. Criar contrato com userId
    const novoContrato = {
      inquilino: inquilinoId,
      imovel: imovelId,
      valor: valor,
      status: 'ativo',
      dataInicio: dataInicio,
      dataTermino: dataTermino,
      userId: usuario.id,  // ⭐ CRUCIAL: Vincular ao usuário
      tenant_id: inquilinoId,
      property_id: imovelId,
      rent_value: Number(valor),
      start_date: dataInicio,
      end_date: dataTermino,
    };

    const contratoId = await db.saveContrato(novoContrato);
    return { success: true, contratoId, message: 'Contrato criado com sucesso!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==============================================================================
// 3. SALVANDO PAGAMENTOS COM VÍNCULO AO CONTRATO
// ==============================================================================

// Exemplo: Registrar um pagamento
export async function registrarPagamento(contratoId, valor, data, metodo, status = 'pago') {
  try {
    const pagamento = {
      contract_id: contratoId,  // Vincular ao contrato
      amount: valor,
      date: data,
      method: metodo,
      status: status,
    };

    const pagamentoId = await db.savePagamento(pagamento);
    return { success: true, pagamentoId, message: 'Pagamento registrado!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==============================================================================
// 4. CONSULTANDO DADOS DO USUÁRIO (Frontend)
// ==============================================================================

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export function ExemploConsultaUsuario() {
  const { user, role } = useContext(AuthContext);
  const [meuContrato, setMeuContrato] = useState(null);
  const [meusPagamentos, setMeusPagamentos] = useState([]);

  useEffect(() => {
    if (!user || role !== 'usuario') return;

    // 1. Buscar contrato do usuário
    const carregarDados = async () => {
      const contratos = await db.getContratosByUserId(user.uid);
      
      if (contratos.length > 0) {
        setMeuContrato(contratos[0]);
        
        // 2. Buscar pagamentos do contrato
        const pagamentos = await db.getPagamentosByContratoId(contratos[0].id);
        setMeusPagamentos(pagamentos);
      }
    };

    carregarDados();
  }, [user, role]);

  return (
    <div>
      <h2>Meu Contrato</h2>
      {meuContrato && (
        <div>
          <p>Imóvel: {meuContrato.imovel}</p>
          <p>Valor: R$ {meuContrato.valor}</p>
        </div>
      )}

      <h2>Meus Pagamentos ({meusPagamentos.length})</h2>
      {meusPagamentos.map(pag => (
        <div key={pag.id}>
          <p>Data: {pag.date}</p>
          <p>Status: {pag.status}</p>
        </div>
      ))}
    </div>
  );
}

// ==============================================================================
// 5. USANDO PERMISSÕES EM COMPONENTES
// ==============================================================================

import { hasPermission, canAccessScreen, ROLES } from '../utils/permissions';

export function ComponenteExemploComPermissoes() {
  const { role } = useContext(AuthContext);

  // Verificar se tem permissão específica
  if (!hasPermission(role, 'canViewOwnContract')) {
    return <p>Você não tem permissão para visualizar contratos</p>;
  }

  // Verificar se pode acessar uma tela
  if (canAccessScreen(role, 'ListaUsuarios')) {
    return <ListaUsuariosComponent />;
  }

  // Verificar role diretamente
  if (role === ROLES.ADMIN) {
    return <AdminPanel />;
  } else if (role === ROLES.USUARIO) {
    return <UsuarioPanel />;
  }

  return <p>Role desconhecido</p>;
}

// ==============================================================================
// 6. ESTRUTURA DE DADOS NO FIRESTORE
// ==============================================================================

/*

ESTRUTURA RECOMENDADA NO FIRESTORE:

/usuarios/{uid}
  - nome: "João Silva"
  - email: "joao@example.com"
  - role: "usuario"  // IMPORTANTE: sempre salvar o role
  - userId: "uid123"
  - criadoEm: timestamp

/inquilinos/{id}
  - nome: "João Silva"
  - cpf: "123.456.789-00"
  - email: "joao@example.com"
  - telefone: "(11) 12345-6789"

/imoveis/{id}
  - endereco: "Rua A, 123, Apt 101"
  - tipo: "Apartamento"
  - andar: "1º"

/contratos/{id}
  - inquilino: "123456789"  // CPF ou ID do inquilino
  - imovel: "imovel_id_123"
  - valor: 1500.00
  - status: "ativo"
  - dataInicio: "2024-01-01"
  - dataTermino: "2025-01-01"
  - userId: "uid123"  // IMPORTANTE: vincular ao usuário
  - tenant_id: "123456789"
  - property_id: "imovel_id_123"
  - rent_value: 1500.00
  - start_date: "2024-01-01"
  - end_date: "2025-01-01"

/pagamentos/{id}
  - contract_id: "contrato_id_123"
  - amount: 1500.00
  - date: "2024-02-01"
  - method: "Transferência Bancária"
  - status: "pago"
  - notes: "Pagamento recebido"
  - userId: "uid123"  // Opcional, para query rápida

*/

// ==============================================================================
// 7. DEPLOY DAS REGRAS FIRESTORE
// ==============================================================================

/*

Para fazer deploy das regras de segurança:

Option 1: Firebase CLI
$ firebase init
$ firebase deploy --only firestore:rules

Option 2: Firebase Console
1. Ir para Cloud Firestore
2. Clicar em "Rules"
3. Copiar conteúdo de ./firestore.rules
4. Clicar em "Publish"

Após deploy, as regras garantem que:
- Admin pode ler/escrever em qualquer coleção
- Usuários só leem/escrevem seus próprios dados
- Contratos e pagamentos filtram por userId automaticamente

*/

// ==============================================================================
// 8. RENATIFICAÇÃO DE USUÁRIOS E DADOS
// ==============================================================================

// Exemplo: Atualizar role de um usuário (apenas admin)
export async function atualizarRoleUsuario(uid, novoRole) {
  try {
    if (novoRole !== 'admin' && novoRole !== 'usuario') {
      throw new Error('Role inválido');
    }

    await setDoc(doc(db, 'usuarios', uid), {
      role: novoRole
    }, { merge: true });

    return { success: true, message: 'Role atualizado!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==============================================================================
// 9. TROUBLESHOOTING CHECKLIST
// ==============================================================================

/*

❌ Problema: "Meu Contrato" mostra mensagem de erro
✅ Solução:
   1. Verificar se o usuário tem role 'usuario' em /usuarios/{uid}
   2. Verificar se existe contrato com userId = user.uid em /contratos
   3. Verificar se contract_id está preenchido nos pagamentos
   4. Rodar: firebase deploy --only firestore:rules

❌ Problema: Usuário vê telas de admin
✅ Solução:
   1. Verificar AppNavigator.js - role deve ser 'usuario', não 'inquilino'
   2. Verificar AuthContext.js - role está sendo carregado corretamente?
   3. Verificar Firestore - role field está correto?
   4. Fazer logout e login novamente

❌ Problema: Pagamentos não aparecem em "Meus Pagamentos"
✅ Solução:
   1. Verificar se contract_id está preenchido nos pagamentos
   2. Rodar: db.getPagamentosByContratoId(contratoId) no console browser
   3. Verificar Firestore rules - estão corretas?

❌ Problema: Erro 403 ao tentar ler dados no Firestore
✅ Solução:
   1. Firestore rules estão desatualizadas
   2. Executar: firebase deploy --only firestore:rules
   3. Verificar se user.uid está correto
   4. Verificar se userId no documento matches user.uid

*/

// ==============================================================================
// 10. EXEMPLO COMPLETO: FLUXO DE UM USUÁRIO
// ==============================================================================

/*

FLUXO PASSO A PASSO:

1. ADMIN CRIA USUÁRIO:
   - Acessa "Cadastro de Usuário"
   - Preenche: Nome, Email, Senha
   - Sistema define role = 'usuario'
   - Usuário criado em Firebase Auth e Firestore

2. ADMIN CRIA INQUILINO:
   - Acessa "Cadastro de Inquilino"
   - Preenche dados do inquilino
   - Salva no Firestore

3. ADMIN CRIA IMÓVEL:
   - Acessa "Cadastro de Imóvel"
   - Preenche dados do imóvel
   - Salva no Firestore

4. ADMIN CRIA CONTRATO:
   - Acessa "Cadastro de Contrato"
   - Seleciona inquilino existente
   - Seleciona imóvel existente
   - Define datas e valor
   - ⭐ IMPORTANTE: Sistema vincula userId do usuário ao contrato
   - Contrato salvo com userId preenchido

5. ADMIN REGISTRA PAGAMENTO:
   - Acessa "Pagamentos"
   - Seleciona contrato
   - Registra: valor, data, método, status
   - Pagamento salvo com contract_id preenchido

6. USUÁRIO FAZ LOGIN:
   - Email + Senha
   - Sistema carrega role = 'usuario'
   - AppNavigator renderiza apenas: Home, Meu Contrato, Meus Pagamentos, etc.

7. USUÁRIO ACESSA MEU CONTRATO:
   - Tela carrega: db.getContratosByUserId(user.uid)
   - Exibe seu contrato com dados do imóvel e inquilino
   - Somente-leitura

8. USUÁRIO ACESSA MEUS PAGAMENTOS:
   - Tela carrega: db.getPagamentosByContratoId(contratoId)
   - Exibe: resumo (pago/pendente/atrasado) + lista
   - Somente-leitura

9. SEGURANÇA:
   - Firestore rules impedem acesso a dados de outros usuários
   - Usuário não consegue ver contratos de outro usuário
   - Admin sempre consegue ver tudo

*/

export default {
  cadastrarUsuarioComRole,
  criarContratoComUsuario,
  registrarPagamento
};
