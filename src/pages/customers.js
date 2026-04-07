// Customers Page
import { store } from '../store.js';
import { renderHeader } from '../components/sidebar.js';
import { channelConfig, formatCurrency, formatDate, getInitials } from '../components/utils.js';
import { toast } from '../components/toast.js';

let searchQuery = '';

export function renderCustomers() {
  const customers = store.getCustomers(searchQuery);

  return `
    ${renderHeader('Customers', `${store.getCustomers().length} total`)}
    <div class="page-content">
      <div class="page-header animate-fade-in">
        <div class="page-header-left">
          <h1 class="page-title">Customers</h1>
          <p class="page-subtitle">Manage your corporate client database</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" id="add-customer-btn">➕ Add Customer</button>
        </div>
      </div>

      <div class="filter-bar animate-fade-in stagger-1">
        <input type="text" class="filter-search" id="customer-search-input" placeholder="🔍 Search by name, company, phone, or email..." value="${searchQuery}" />
        <span class="filter-count">${customers.length} customers</span>
      </div>

      <div class="card animate-fade-in stagger-2" style="padding:0;overflow:hidden">
        ${customers.length > 0 ? `
          <div style="overflow-x:auto">
            <table class="data-table customer-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Preferred Channel</th>
                  <th>Orders</th>
                  <th>Total Spend</th>
                  <th>Since</th>
                </tr>
              </thead>
              <tbody>
                ${customers.map(customer => {
                  const orders = store.getCustomerOrders(customer.id);
                  const actualSpend = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
                  return `
                    <tr data-customer-id="${customer.id}">
                      <td>
                        <div class="customer-name-cell">
                          <div class="customer-table-avatar">${getInitials(customer.name)}</div>
                          <div>
                            <div class="table-cell-main">${customer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style="font-weight:500">${customer.company}</td>
                      <td>
                        <div class="customer-contact-cell">
                          <span class="customer-contact-item">📞 ${customer.phone}</span>
                          <span class="customer-contact-item">📧 ${customer.email}</span>
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-channel-${customer.preferredChannel}">
                          ${channelConfig[customer.preferredChannel]?.icon || '📱'} ${channelConfig[customer.preferredChannel]?.label || customer.preferredChannel}
                        </span>
                      </td>
                      <td style="font-weight:600;text-align:center">${orders.length}</td>
                      <td class="customer-spend-cell">${formatCurrency(actualSpend || customer.totalSpend)}</td>
                      <td style="font-size:13px;color:var(--text-secondary)">${formatDate(customer.createdAt)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <div class="empty-state-title">No customers found</div>
            <div class="empty-state-text">Try a different search or add a new customer.</div>
          </div>
        `}
      </div>
    </div>

    <!-- Add Customer Modal -->
    <div class="modal-overlay" id="add-customer-modal" style="display:none">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Add New Customer</h2>
          <button class="modal-close" id="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group" style="margin-bottom:var(--space-md)">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" id="modal-cust-name" class="form-input" placeholder="Customer name" />
          </div>
          <div class="form-group" style="margin-bottom:var(--space-md)">
            <label class="form-label">Company <span class="required">*</span></label>
            <input type="text" id="modal-cust-company" class="form-input" placeholder="Company name" />
          </div>
          <div class="form-row" style="margin-bottom:var(--space-md)">
            <div class="form-group">
              <label class="form-label">Phone <span class="required">*</span></label>
              <input type="tel" id="modal-cust-phone" class="form-input" placeholder="+91-XXXXXXXXXX" />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="modal-cust-email" class="form-input" placeholder="email@company.com" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Preferred Channel</label>
            <select id="modal-cust-channel" class="form-input">
              ${Object.entries(channelConfig).map(([key, cfg]) => `
                <option value="${key}">${cfg.icon} ${cfg.label}</option>
              `).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button class="btn btn-primary" id="save-customer">✅ Save Customer</button>
        </div>
      </div>
    </div>
  `;
}

export function initCustomers() {
  // Search
  const searchInput = document.getElementById('customer-search-input');
  let timeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        searchQuery = searchInput.value;
        refreshCustomers();
      }, 300);
    });
  }

  // Add customer modal
  const modal = document.getElementById('add-customer-modal');
  const addBtn = document.getElementById('add-customer-btn');
  const closeBtn = document.getElementById('close-modal');
  const cancelBtn = document.getElementById('cancel-modal');
  const saveBtn = document.getElementById('save-customer');

  if (addBtn) addBtn.addEventListener('click', () => modal.style.display = 'flex');
  if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = document.getElementById('modal-cust-name')?.value?.trim();
      const company = document.getElementById('modal-cust-company')?.value?.trim();
      const phone = document.getElementById('modal-cust-phone')?.value?.trim();
      const email = document.getElementById('modal-cust-email')?.value?.trim();
      const preferredChannel = document.getElementById('modal-cust-channel')?.value;

      if (!name || !company || !phone) {
        toast.error('Missing Info', 'Please fill in name, company, and phone');
        return;
      }

      store.addCustomer({ name, company, phone, email, preferredChannel });
      toast.success('Customer Added', `${name} has been added successfully`);
      modal.style.display = 'none';
      searchQuery = '';
      refreshCustomers();
    });
  }

  // Row click
  document.querySelectorAll('tr[data-customer-id]').forEach(row => {
    row.addEventListener('click', () => {
      // Could navigate to customer detail in future
      const cust = store.getCustomer(row.dataset.customerId);
      if (cust) {
        toast.info(cust.name, `${cust.company} · ${store.getCustomerOrders(cust.id).length} orders`);
      }
    });
  });
}

function refreshCustomers() {
  const container = document.querySelector('.main-content');
  if (container) {
    container.innerHTML = renderCustomers();
    initCustomers();
  }
}
