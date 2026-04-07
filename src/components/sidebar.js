// Sidebar & Header components
import { router } from '../router.js';
import { store } from '../store.js';
import { getInitials } from './utils.js';

export function renderSidebar() {
  const pendingCount = store.getOrders().filter(o => o.status === 'new').length;

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">C</div>
        <div class="sidebar-brand-text">
          <div class="sidebar-brand-name">CaterFlow</div>
          <div class="sidebar-brand-tagline">Order Management</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Main</div>
        <a href="#/" class="sidebar-link" data-path="/">
          <span class="sidebar-link-icon">📊</span>
          <span>Dashboard</span>
        </a>
        <a href="#/orders" class="sidebar-link" data-path="/orders">
          <span class="sidebar-link-icon">📋</span>
          <span>Orders</span>
          ${pendingCount > 0 ? `<span class="sidebar-link-badge">${pendingCount}</span>` : ''}
        </a>
        <a href="#/orders/new" class="sidebar-link" data-path="/orders/new">
          <span class="sidebar-link-icon">➕</span>
          <span>New Order</span>
        </a>

        <div class="sidebar-section-label">Manage</div>
        <a href="#/customers" class="sidebar-link" data-path="/customers">
          <span class="sidebar-link-icon">👥</span>
          <span>Customers</span>
        </a>
        <a href="#/menu" class="sidebar-link" data-path="/menu">
          <span class="sidebar-link-icon">🍽️</span>
          <span>Menu</span>
        </a>
        <a href="#/analytics" class="sidebar-link" data-path="/analytics">
          <span class="sidebar-link-icon">📈</span>
          <span>Analytics</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">${getInitials('Admin User')}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">Admin User</div>
            <div class="sidebar-user-role">Operations Manager</div>
          </div>
        </div>
      </div>
    </aside>
  `;
}

export function renderHeader(title, subtitle = '') {
  return `
    <header class="header">
      <div class="header-title">
        ${title}
        ${subtitle ? `<span>${subtitle}</span>` : ''}
      </div>
      <div class="header-search">
        <span class="header-search-icon">🔍</span>
        <input type="text" id="global-search" placeholder="Search orders, customers..." />
      </div>
      <div class="header-actions">
        <button class="header-action-btn" id="btn-notifications" title="Notifications">
          🔔
          <div class="notification-dot"></div>
        </button>
        <button class="header-action-btn" id="btn-refresh" title="Refresh Data">
          🔄
        </button>
      </div>
    </header>
  `;
}

export function updateActiveLink() {
  const currentPath = router.getCurrentPath();
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const linkPath = link.getAttribute('data-path');
    if (linkPath === currentPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
