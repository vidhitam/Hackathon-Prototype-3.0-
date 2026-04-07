// Toast notification system
class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
  }

  init() {
    this.container = document.getElementById('toast-root');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-root';
      document.body.appendChild(this.container);
    }
    this.container.className = 'toast-container';
  }

  show({ type = 'info', title, message, duration = 4000 }) {
    if (!this.container) this.init();

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Dismiss">✕</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);
    this.toasts.push(toast);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('leaving');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  }

  success(title, message) { return this.show({ type: 'success', title, message }); }
  error(title, message) { return this.show({ type: 'error', title, message }); }
  warning(title, message) { return this.show({ type: 'warning', title, message }); }
  info(title, message) { return this.show({ type: 'info', title, message }); }
}

export const toast = new ToastManager();
