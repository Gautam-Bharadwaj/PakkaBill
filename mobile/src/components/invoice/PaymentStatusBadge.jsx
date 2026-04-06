import React from 'react';
import AppBadge from '../common/AppBadge';

export default function PaymentStatusBadge({ status }) {
  const map = {
    paid: { label: 'Paid', variant: 'success' },
    partial: { label: 'Partial', variant: 'warning' },
    unpaid: { label: 'Unpaid', variant: 'danger' },
  };
  const { label, variant } = map[status] || { label: status, variant: 'muted' };
  return <AppBadge label={label} variant={variant} />;
}
