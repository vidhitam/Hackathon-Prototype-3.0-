// Utility helpers
export const channelConfig = {
  phone: { label: 'Phone', icon: '📞', color: 'var(--channel-phone)', bgColor: 'var(--channel-phone-subtle)' },
  whatsapp: { label: 'WhatsApp', icon: '💬', color: 'var(--channel-whatsapp)', bgColor: 'var(--channel-whatsapp-subtle)' },
  email: { label: 'Email', icon: '📧', color: 'var(--channel-email)', bgColor: 'var(--channel-email-subtle)' },
  website: { label: 'Website', icon: '🌐', color: 'var(--channel-website)', bgColor: 'var(--channel-website-subtle)' }
};

export const statusConfig = {
  new: { label: 'New', icon: '🆕' },
  confirmed: { label: 'Confirmed', icon: '✓' },
  preparing: { label: 'Preparing', icon: '👨‍🍳' },
  ready: { label: 'Ready', icon: '✅' },
  delivered: { label: 'Delivered', icon: '🚚' },
  cancelled: { label: 'Cancelled', icon: '❌' }
};

export function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getNextStatus(currentStatus) {
  const flow = ['new', 'confirmed', 'preparing', 'ready', 'delivered'];
  const idx = flow.indexOf(currentStatus);
  if (idx >= 0 && idx < flow.length - 1) return flow[idx + 1];
  return null;
}

export function animateCounter(element, target, duration = 800) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(start + (target - start) * eased);

    if (typeof target === 'number' && target > 1000) {
      element.textContent = current.toLocaleString('en-IN');
    } else {
      element.textContent = current;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
