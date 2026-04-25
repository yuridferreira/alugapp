export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `R$ ${amount.toFixed(2)}`;
};

export const formatDate = (value) => {
  if (!value) return 'Nao informado';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
};

export const getPaymentStatusLabel = (status, vencimento) => {
  const rawStatus = String(status || '').trim().toLowerCase();
  if (rawStatus === 'pago' || rawStatus === 'paid') return 'Pago';
  if (rawStatus === 'atrasado' || rawStatus === 'overdue' || rawStatus === 'atrasada') return 'Atrasado';
  if (rawStatus === 'pendente' || rawStatus === 'pending') {
    if (vencimento) {
      const dueDate = new Date(`${vencimento}T12:00:00`);
      const today = new Date();
      const todayAtNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
      if (!Number.isNaN(dueDate.getTime()) && dueDate < todayAtNoon) return 'Atrasado';
    }
    return 'Pendente';
  }

  if (vencimento) {
    const dueDate = new Date(`${vencimento}T12:00:00`);
    const today = new Date();
    const todayAtNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
    if (!Number.isNaN(dueDate.getTime()) && dueDate < todayAtNoon) return 'Atrasado';
  }

  return 'Pendente';
};

export const getPaymentStatusTheme = (statusLabel) => {
  if (statusLabel === 'Pago') {
    return {
      badgeStyle: { backgroundColor: '#e7f6ec' },
      textStyle: { color: '#1f8f4c' },
    };
  }

  if (statusLabel === 'Atrasado') {
    return {
      badgeStyle: { backgroundColor: '#fdecec' },
      textStyle: { color: '#c0392b' },
    };
  }

  return {
    badgeStyle: { backgroundColor: '#fff6dd' },
    textStyle: { color: '#b7791f' },
  };
};

export const getContractLifecycleLabel = (status) => {
  const rawStatus = String(status || '').trim().toLowerCase();
  if (rawStatus === 'ativo') return 'Ativo';
  if (rawStatus === 'finalizado') return 'Finalizado';
  return status || 'Nao informado';
};
