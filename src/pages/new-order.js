// New Order Page
import { store } from '../store.js';
import { renderHeader } from '../components/sidebar.js';
import { menuCategories } from '../data/menu-items.js';
import { channelConfig, formatCurrency } from '../components/utils.js';
import { toast } from '../components/toast.js';

let selectedChannel = 'phone';
let selectedCustomer = null;
let selectedItems = []; // { menuItemId, name, quantity, unitPrice, dietaryTags }
let selectedDietaryTags = [];
let menuCategoryFilter = 'all';

export function renderNewOrder() {
  const customers = store.getCustomers();
  const menuItems = store.getMenuItems(menuCategoryFilter).filter(m => m.available);

  const subtotal = selectedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.18);
  const deliveryCharge = subtotal > 10000 ? 0 : (subtotal > 0 ? 500 : 0);
  const total = subtotal + tax + deliveryCharge;

  return `
    ${renderHeader('New Order', 'Capture from any channel')}
    <div class="page-content">
      <div class="page-header animate-fade-in">
        <div class="page-header-left">
          <h1 class="page-title">Create New Order</h1>
          <p class="page-subtitle">Capture an order from any channel — phone, WhatsApp, email, or website</p>
        </div>
      </div>

      <!-- Channel Selector -->
      <div class="channel-selector animate-fade-in stagger-1">
        ${Object.entries(channelConfig).map(([key, cfg]) => `
          <div class="channel-option ${selectedChannel === key ? 'selected' : ''}" data-channel="${key}">
            <span class="channel-option-icon">${cfg.icon}</span>
            <span class="channel-option-label">${cfg.label}</span>
            <span class="channel-option-desc">${key === 'phone' ? 'Call order' : key === 'whatsapp' ? 'Chat order' : key === 'email' ? 'Email order' : 'Online order'}</span>
          </div>
        `).join('')}
      </div>

      <div class="new-order-layout">
        <!-- Left: Form -->
        <div class="order-form">
          <!-- Customer Section -->
          <div class="order-form-section animate-fade-in stagger-2">
            <div class="order-form-section-title">
              <span class="section-icon">👤</span> Customer Details
            </div>

            ${selectedCustomer ? `
              <div class="selected-customer">
                <div style="width:36px;height:36px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:white;flex-shrink:0">
                  ${selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div class="selected-customer-info">
                  <div style="font-weight:600;color:var(--text-primary)">${selectedCustomer.name}</div>
                  <div style="font-size:12px;color:var(--text-secondary)">${selectedCustomer.company} · ${selectedCustomer.phone}</div>
                </div>
                <button class="remove-btn" id="remove-customer" title="Change customer">✕</button>
              </div>
            ` : `
              <div class="customer-lookup">
                <input type="text" id="customer-search" class="form-input" placeholder="Search customer by name, company, or phone..." />
                <div class="customer-lookup-results" id="customer-results" style="display:none"></div>
              </div>
              <div style="margin-top:var(--space-sm);font-size:12px;color:var(--text-tertiary)">Type to search existing customers or add details manually below</div>

              <div class="form-row" style="margin-top: var(--space-md)">
                <div class="form-group">
                  <label class="form-label">Name <span class="required">*</span></label>
                  <input type="text" id="new-cust-name" class="form-input" placeholder="Customer name" />
                </div>
                <div class="form-group">
                  <label class="form-label">Company</label>
                  <input type="text" id="new-cust-company" class="form-input" placeholder="Company name" />
                </div>
              </div>
              <div class="form-row" style="margin-top: var(--space-md)">
                <div class="form-group">
                  <label class="form-label">Phone <span class="required">*</span></label>
                  <input type="tel" id="new-cust-phone" class="form-input" placeholder="+91-XXXXXXXXXX" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" id="new-cust-email" class="form-input" placeholder="email@company.com" />
                </div>
              </div>
            `}
          </div>

          <!-- Menu Items Section -->
          <div class="order-form-section animate-fade-in stagger-3">
            <div class="order-form-section-title">
              <span class="section-icon">🍽️</span> Menu Items
            </div>

            <div class="menu-categories" id="menu-categories">
              ${menuCategories.map(cat => `
                <button class="menu-category-btn ${menuCategoryFilter === cat.id ? 'active' : ''}" data-category="${cat.id}">
                  ${cat.emoji} ${cat.label}
                </button>
              `).join('')}
            </div>

            <div class="menu-items-grid" id="menu-items-grid">
              ${menuItems.map(item => `
                <div class="menu-item-option" data-menu-id="${item.id}">
                  <div style="font-size:24px">${item.emoji}</div>
                  <div class="menu-item-option-info">
                    <div class="menu-item-option-name">${item.name}</div>
                    <div class="menu-item-option-price">${formatCurrency(item.price)}/plate</div>
                  </div>
                  <button class="menu-item-add-btn" data-menu-id="${item.id}" title="Add to order">+</button>
                </div>
              `).join('')}
            </div>

            <!-- Selected Items -->
            ${selectedItems.length > 0 ? `
              <div class="selected-items" style="margin-top: var(--space-lg)">
                <div class="selected-items-header">
                  <span>Selected Items (${selectedItems.length})</span>
                  <span>Total: ${formatCurrency(subtotal)}</span>
                </div>
                ${selectedItems.map((item, idx) => `
                  <div class="selected-item-row">
                    <span class="selected-item-name">${item.name}</span>
                    <div class="quantity-control">
                      <button class="qty-btn" data-idx="${idx}" data-action="decrease">−</button>
                      <span class="quantity-value">${item.quantity}</span>
                      <button class="qty-btn" data-idx="${idx}" data-action="increase">+</button>
                    </div>
                    <span class="selected-item-price">${formatCurrency(item.quantity * item.unitPrice)}</span>
                    <button class="selected-item-remove" data-idx="${idx}" title="Remove">✕</button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Event Details -->
          <div class="order-form-section animate-fade-in stagger-4">
            <div class="order-form-section-title">
              <span class="section-icon">📅</span> Event Details
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Event Date <span class="required">*</span></label>
                <input type="date" id="event-date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Event Time <span class="required">*</span></label>
                <input type="time" id="event-time" class="form-input" value="12:00" />
              </div>
            </div>

            <div class="form-row" style="margin-top: var(--space-md)">
              <div class="form-group">
                <label class="form-label">Headcount <span class="required">*</span></label>
                <input type="number" id="headcount" class="form-input" min="1" placeholder="Number of guests" value="50" />
              </div>
              <div class="form-group">
                <label class="form-label">Delivery Address</label>
                <input type="text" id="delivery-address" class="form-input" placeholder="Full delivery address" />
              </div>
            </div>

            <div class="form-group" style="margin-top: var(--space-md)">
              <label class="form-label">Special Instructions</label>
              <textarea id="special-instructions" class="form-input" rows="3" placeholder="Any special requirements, dietary notes, setup instructions..."></textarea>
            </div>

            <div class="form-group" style="margin-top: var(--space-md)">
              <label class="form-label">Dietary Requirements</label>
              <div class="dietary-tags">
                ${['Vegetarian', 'Non-Veg', 'Vegan', 'Gluten-Free', 'Halal', 'Nut-Free', 'Jain', 'Low Spice'].map(tag => `
                  <button class="dietary-tag-option ${selectedDietaryTags.includes(tag) ? 'selected' : ''}" data-tag="${tag}">${tag}</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Summary -->
        <div class="order-summary">
          <div class="card" style="position:sticky;top:calc(var(--header-height) + var(--space-xl))">
            <div class="card-header">
              <div class="card-title">Order Summary</div>
            </div>

            <div style="margin-bottom:var(--space-md)">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span class="badge badge-channel-${selectedChannel}">${channelConfig[selectedChannel].icon} ${channelConfig[selectedChannel].label}</span>
                ${selectedCustomer ? `<span style="font-size:13px;color:var(--text-secondary)">${selectedCustomer.name}</span>` : ''}
              </div>
              <div style="font-size:12px;color:var(--text-tertiary)">${selectedItems.length} items selected</div>
            </div>

            <div class="summary-row">
              <span class="label">Subtotal</span>
              <span class="value">${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span class="label">GST (18%)</span>
              <span class="value">${formatCurrency(tax)}</span>
            </div>
            <div class="summary-row">
              <span class="label">Delivery</span>
              <span class="value">${deliveryCharge === 0 && subtotal > 0 ? '<span style="color:var(--success)">FREE</span>' : formatCurrency(deliveryCharge)}</span>
            </div>
            <div class="summary-row summary-total">
              <span class="label">Total</span>
              <span class="value">${formatCurrency(total)}</span>
            </div>

            ${subtotal > 10000 ? '<div style="font-size:11px;color:var(--success);margin-top:8px">🎉 Free delivery on orders above ₹10,000</div>' : ''}

            <button class="btn btn-primary btn-lg" style="width:100%;margin-top:var(--space-lg)" id="submit-order" ${selectedItems.length === 0 ? 'disabled style="opacity:0.5;pointer-events:none;width:100%;margin-top:var(--space-lg)"' : ''}>
              ✅ Create Order
            </button>

            <button class="btn btn-ghost" style="width:100%;margin-top:var(--space-sm)" id="reset-order">
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initNewOrder() {
  // Set default date to tomorrow
  const dateInput = document.getElementById('event-date');
  if (dateInput && !dateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().slice(0, 10);
  }

  // Channel selection
  document.querySelectorAll('.channel-option').forEach(opt => {
    opt.addEventListener('click', () => {
      selectedChannel = opt.dataset.channel;
      reRender();
    });
  });

  // Customer search
  const customerSearch = document.getElementById('customer-search');
  if (customerSearch) {
    let searchTimeout;
    customerSearch.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const q = customerSearch.value.trim();
        const results = document.getElementById('customer-results');
        if (q.length < 2) {
          results.style.display = 'none';
          return;
        }
        const matches = store.getCustomers(q).slice(0, 5);
        if (matches.length) {
          results.innerHTML = matches.map(c => `
            <div class="customer-lookup-item" data-cust-id="${c.id}">
              <div class="customer-avatar">${c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div class="customer-lookup-details">
                <div class="customer-lookup-name">${c.name}</div>
                <div class="customer-lookup-company">${c.company} · ${c.phone}</div>
              </div>
            </div>
          `).join('');
          results.style.display = 'block';

          results.querySelectorAll('.customer-lookup-item').forEach(item => {
            item.addEventListener('click', () => {
              selectedCustomer = store.getCustomer(item.dataset.custId);
              reRender();
            });
          });
        } else {
          results.innerHTML = '<div style="padding:12px;font-size:13px;color:var(--text-tertiary)">No customers found. Fill in details below.</div>';
          results.style.display = 'block';
        }
      }, 200);
    });
  }

  // Remove customer
  const removeBtn = document.getElementById('remove-customer');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      selectedCustomer = null;
      reRender();
    });
  }

  // Menu category filter
  document.querySelectorAll('.menu-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      menuCategoryFilter = btn.dataset.category;
      reRender();
    });
  });

  // Add menu items
  document.querySelectorAll('.menu-item-add-btn, .menu-item-option').forEach(el => {
    el.addEventListener('click', (e) => {
      const menuId = el.dataset.menuId || el.closest('.menu-item-option')?.dataset.menuId;
      if (!menuId) return;
      e.stopPropagation();

      const existing = selectedItems.find(i => i.menuItemId === menuId);
      if (existing) {
        existing.quantity += 10;
      } else {
        const menuItem = store.getMenuItems().find(m => m.id === menuId);
        if (menuItem) {
          selectedItems.push({
            menuItemId: menuItem.id,
            name: menuItem.name,
            quantity: 10,
            unitPrice: menuItem.price,
            dietaryTags: menuItem.dietaryTags
          });
        }
      }
      reRender();
    });
  });

  // Quantity controls
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const action = btn.dataset.action;
      if (action === 'increase') {
        selectedItems[idx].quantity += 5;
      } else {
        selectedItems[idx].quantity = Math.max(1, selectedItems[idx].quantity - 5);
      }
      reRender();
    });
  });

  // Remove items
  document.querySelectorAll('.selected-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      selectedItems.splice(idx, 1);
      reRender();
    });
  });

  // Dietary tags
  document.querySelectorAll('.dietary-tag-option').forEach(tag => {
    tag.addEventListener('click', () => {
      const t = tag.dataset.tag;
      if (selectedDietaryTags.includes(t)) {
        selectedDietaryTags = selectedDietaryTags.filter(x => x !== t);
      } else {
        selectedDietaryTags.push(t);
      }
      tag.classList.toggle('selected');
    });
  });

  // Submit
  const submitBtn = document.getElementById('submit-order');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmitOrder);
  }

  // Reset
  const resetBtn = document.getElementById('reset-order');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      selectedChannel = 'phone';
      selectedCustomer = null;
      selectedItems = [];
      selectedDietaryTags = [];
      menuCategoryFilter = 'all';
      reRender();
      toast.info('Form Cleared', 'All fields have been reset');
    });
  }
}

function handleSubmitOrder() {
  // Validate
  const eventDate = document.getElementById('event-date')?.value;
  const eventTime = document.getElementById('event-time')?.value || '12:00';
  const headcount = document.getElementById('headcount')?.value;
  const deliveryAddress = document.getElementById('delivery-address')?.value;
  const specialInstructions = document.getElementById('special-instructions')?.value;

  let customer = selectedCustomer;
  if (!customer) {
    const name = document.getElementById('new-cust-name')?.value?.trim();
    const phone = document.getElementById('new-cust-phone')?.value?.trim();
    const company = document.getElementById('new-cust-company')?.value?.trim() || '';
    const email = document.getElementById('new-cust-email')?.value?.trim() || '';

    if (!name || !phone) {
      toast.error('Missing Info', 'Please provide customer name and phone number');
      return;
    }

    customer = store.addCustomer({ name, company, phone, email, preferredChannel: selectedChannel });
  }

  if (selectedItems.length === 0) {
    toast.error('No Items', 'Please add at least one menu item');
    return;
  }

  if (!eventDate) {
    toast.error('Missing Date', 'Please select an event date');
    return;
  }

  const subtotal = selectedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.18);
  const deliveryChg = subtotal > 10000 ? 0 : 500;

  const order = store.addOrder({
    channel: selectedChannel,
    status: 'new',
    customer: {
      id: customer.id,
      name: customer.name,
      company: customer.company || '',
      phone: customer.phone,
      email: customer.email || ''
    },
    items: selectedItems,
    eventDate: new Date(`${eventDate}T${eventTime}`).toISOString(),
    deliveryAddress: deliveryAddress || '',
    headcount: parseInt(headcount) || 50,
    specialInstructions: specialInstructions || '',
    subtotal,
    tax,
    deliveryCharge: deliveryChg,
    total: subtotal + tax + deliveryChg
  });

  toast.success('Order Created! 🎉', `${order.id} has been created successfully`);

  // Reset form
  selectedChannel = 'phone';
  selectedCustomer = null;
  selectedItems = [];
  selectedDietaryTags = [];
  menuCategoryFilter = 'all';

  // Navigate to orders
  setTimeout(() => {
    window.location.hash = `#/orders/${order.id}`;
  }, 800);
}

function reRender() {
  const container = document.querySelector('.main-content');
  if (container) {
    container.innerHTML = renderNewOrder();
    initNewOrder();
  }
}
