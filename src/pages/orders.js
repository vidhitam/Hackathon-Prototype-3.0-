// Orders List Page
import { store } from '../store.js';
import { renderHeader } from '../components/sidebar.js';
import { channelConfig, statusConfig, formatCurrency, formatDate, formatTime, getNextStatus } from '../components/utils.js';
import { toast } from '../components/toast.js';

let currentView = 'table';
let filters = { channel: '', status: '', search: '' };

export function renderOrders() {
  const orders = store.getOrders(filters);
  const allOrders = store.getOrders();

  return `
    ${renderHeader('Orders', `${allOrders.length} total`)}
    <div class="page-content">
      <div class="page-header animate-fade-in">
        <div class="page-header-left">
          <h1 class="page-title">All Orders</h1>
          <p class="page-subtitle">Manage and track all orders across channels</p>
        </div>
        <div class="page-header-actions">
          <div class="orders-view-toggle" id="view-toggle">
            <button class="${currentView === 'table' ? 'active' : ''}" data-view="table">📋 Table</button>
            <button class="${currentView === 'kanban' ? 'active' : ''}" data-view="kanban">📊 Kanban</button>
          </div>
          <a href="#/orders/new" class="btn btn-primary">➕ New Order</a>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar animate-fade-in stagger-1">
        <input type="text" class="filter-search" id="filter-search" placeholder="🔍 Search by order ID, customer, or company..." value="${filters.search}" />
        <select id="filter-channel">
          <option value="">All Channels</option>
          ${Object.entries(channelConfig).map(([key, cfg]) => `
            <option value="${key}" ${filters.channel === key ? 'selected' : ''}>${cfg.icon} ${cfg.label}</option>
          `).join('')}
        </select>
        <select id="filter-status">
          <option value="">All Statuses</option>
          ${Object.entries(statusConfig).map(([key, cfg]) => `
            <option value="${key}" ${filters.status === key ? 'selected' : ''}>${cfg.label}</option>
          `).join('')}
        </select>
        <span class="filter-count">${orders.length} of ${allOrders.length} orders</span>
      </div>

      <!-- Content -->
      <div id="orders-content" class="animate-fade-in stagger-2">
        ${currentView === 'table' ? renderTableView(orders) : renderKanbanView(orders)}
      </div>
    </div>
  `;
}

function renderTableView(orders) {
  if (!orders.length) {
    return `
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-title">No orders found</div>
          <div class="empty-state-text">Try adjusting your filters or create a new order.</div>
          <a href="#/orders/new" class="btn btn-primary">➕ Create Order</a>
        </div>
      </div>
    `;
  }

  return `
    <div class="card" style="padding: 0; overflow: hidden;">
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Channel</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Event Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr data-order-id="${order.id}">
                <td>
                  <div class="order-id-cell">
                    <span class="order-id-text">${order.id}</span>
                  </div>
                </td>
                <td>
                  <span class="badge badge-channel-${order.channel}">${channelConfig[order.channel].icon} ${channelConfig[order.channel].label}</span>
                </td>
                <td>
                  <div class="order-customer-cell">
                    <span class="order-customer-name">${order.customer.name}</span>
                    <span class="order-customer-company">${order.customer.company}</span>
                  </div>
                </td>
                <td>${order.items.length} items · ${order.headcount} pax</td>
                <td>
                  <div class="order-date-cell">
                    ${formatDate(order.eventDate)}
                    <span class="time">${formatTime(order.eventDate)}</span>
                  </div>
                </td>
                <td class="order-amount-cell">${formatCurrency(order.total)}</td>
                <td>
                  <span class="badge badge-status-${order.status}">${statusConfig[order.status].icon} ${statusConfig[order.status].label}</span>
                </td>
                <td>
                  <div class="order-actions-cell">
                    ${getNextStatus(order.status) ? `
                      <button class="btn btn-sm btn-primary advance-status-btn" data-id="${order.id}" data-next="${getNextStatus(order.status)}" title="Advance to ${statusConfig[getNextStatus(order.status)].label}">
                        ${statusConfig[getNextStatus(order.status)].icon}
                      </button>
                    ` : ''}
                    <button class="btn btn-sm btn-ghost view-order-btn" data-id="${order.id}" title="View Details">👁️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderKanbanView(orders) {
  const columns = ['new', 'confirmed', 'preparing', 'ready', 'delivered'];

  return `
    <div class="orders-kanban">
      ${columns.map(status => {
        const columnOrders = orders.filter(o => o.status === status);
        return `
          <div class="kanban-column">
            <div class="kanban-column-header">
              <span class="kanban-column-title">${statusConfig[status].icon} ${statusConfig[status].label}</span>
              <span class="kanban-column-count">${columnOrders.length}</span>
            </div>
            <div class="kanban-column-body">
              ${columnOrders.map(order => `
                <div class="kanban-card" data-order-id="${order.id}">
                  <div class="kanban-card-header">
                    <span class="kanban-card-id">${order.id}</span>
                    <span class="badge badge-channel-${order.channel}" style="font-size:10px;padding:2px 6px">${channelConfig[order.channel].icon}</span>
                  </div>
                  <div class="kanban-card-customer">${order.customer.name}</div>
                  <div class="kanban-card-details">
                    <span>${order.customer.company}</span>
                    <span>${order.items.length} items · ${order.headcount} pax</span>
                    <span>${formatDate(order.eventDate)}</span>
                  </div>
                  <div class="kanban-card-footer">
                    <span class="kanban-card-amount">${formatCurrency(order.total)}</span>
                    ${getNextStatus(order.status) ? `
                      <button class="btn btn-sm btn-primary advance-status-btn" data-id="${order.id}" data-next="${getNextStatus(order.status)}">
                        ${statusConfig[getNextStatus(order.status)].icon} →
                      </button>
                    ` : ''}
                  </div>
                </div>
              `).join('') || `
                <div class="empty-state" style="padding:var(--space-lg);opacity:0.5">
                  <span style="font-size:24px">📭</span>
                  <div style="font-size:12px;color:var(--text-tertiary)">No orders</div>
                </div>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function initOrders() {
  // View toggle
  document.querySelectorAll('#view-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      const content = document.getElementById('orders-content');
      if (content) {
        const orders = store.getOrders(filters);
        content.innerHTML = currentView === 'table' ? renderTableView(orders) : renderKanbanView(orders);
        document.querySelectorAll('#view-toggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bindOrderEvents();
      }
    });
  });

  // Filters
  const searchInput = document.getElementById('filter-search');
  const channelSelect = document.getElementById('filter-channel');
  const statusSelect = document.getElementById('filter-status');

  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        filters.search = searchInput.value;
        refreshOrders();
      }, 300);
    });
  }

  if (channelSelect) {
    channelSelect.addEventListener('change', () => {
      filters.channel = channelSelect.value;
      refreshOrders();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      filters.status = statusSelect.value;
      refreshOrders();
    });
  }

  bindOrderEvents();
}

function refreshOrders() {
  const content = document.getElementById('orders-content');
  const orders = store.getOrders(filters);
  if (content) {
    content.innerHTML = currentView === 'table' ? renderTableView(orders) : renderKanbanView(orders);
    bindOrderEvents();
  }
  const countEl = document.querySelector('.filter-count');
  if (countEl) {
    countEl.textContent = `${orders.length} of ${store.getOrders().length} orders`;
  }
}

function bindOrderEvents() {
  // Advance status buttons
  document.querySelectorAll('.advance-status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const orderId = btn.dataset.id;
      const nextStatus = btn.dataset.next;
      store.updateOrderStatus(orderId, nextStatus);
      toast.success('Status Updated', `Order ${orderId} → ${statusConfig[nextStatus].label}`);
      refreshOrders();
    });
  });

  // Row click to view detail
  document.querySelectorAll('tr[data-order-id], .kanban-card[data-order-id]').forEach(el => {
    el.addEventListener('click', () => {
      window.location.hash = `#/orders/${el.dataset.orderId}`;
    });
  });

  // View button
  document.querySelectorAll('.view-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.hash = `#/orders/${btn.dataset.id}`;
    });
  });
}
