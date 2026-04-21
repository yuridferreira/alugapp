// utils/permissions.js
// Definição de roles e permissões do sistema RBAC

import React from 'react';
import { View, Text } from 'react-native';

export const ROLES = {
  ADMIN: 'admin',
  USUARIO: 'usuario'
};

export const PERMISSIONS = {
  // Admin tem tudo
  [ROLES.ADMIN]: {
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
  [ROLES.USUARIO]: {
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

// Rotas acessíveis por role
export const ACCESSIBLE_SCREENS = {
  [ROLES.ADMIN]: [
    'Home',
    'CadastroUsuario',
    'ListaUsuarios',
    'DashboardIA',
    'CadastroInquilino',
    'ListaInquilinos',
    'CadastroImovel',
    'ListaImoveis',
    'Contrato',
    'ListaContratos',
    'Pagamentos',
    'Historico',
    'Configuracoes',
    'Ajuda'
  ],
  [ROLES.USUARIO]: [
    'Home',
    'MeuContrato',
    'MeusPagamentos',
    'Historico',
    'Configuracoes',
    'Ajuda'
  ]
};

// Função para verificar se o usuário tem uma permissão
export const hasPermission = (userRole, permission) => {
  if (!userRole || !PERMISSIONS[userRole]) return false;
  return PERMISSIONS[userRole][permission] || false;
};

// Função para verificar se o usuário tem acesso a uma tela
export const canAccessScreen = (userRole, screenName) => {
  if (!userRole || !ACCESSIBLE_SCREENS[userRole]) return false;
  return ACCESSIBLE_SCREENS[userRole].includes(screenName);
};

// Middleware para proteger rotas/componentes
export const requirePermission = (permission) => (Component) => {
  return (props) => {
    const { role } = props; // Assume que role vem do contexto
    if (!hasPermission(role, permission)) {
      // Retornar componente de acesso negado ou redirecionar
      return <AccessDenied />;
    }
    return <Component {...props} />;
  };
};

// Componente simples de acesso negado
const AccessDenied = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Acesso negado. Você não tem permissão para acessar esta página.</Text>
  </View>
);