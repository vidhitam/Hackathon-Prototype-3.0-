// Menu Management Page
import { store } from '../store.js';
import { renderHeader } from '../components/sidebar.js';
import { menuCategories } from '../data/menu-items.js';
import { formatCurrency } from '../components/utils.js';
import { toast } from '../components/toast.js';

let activeCategory = 'all';

export function renderMenuManagement() {
  const allItems = store.getMenuItems();
  const items = activeCategory === 'all' ? allItems : allItems.filter(i => i.category === activeCategory);

  return `
    ${renderHeader('Menu', `${allItems.length} items`)}
    <div class="page-content">
      <div class="page-header animate-fade-in">
        <div class="page-header-left">
          <h1 class="page-title">Menu Management</h1>
          <p class="page-subtitle">Manage your catering menu catalog and availability</p>
        </div>
        <div class="page-header-actions">
          <div style="display:flex;align-items:center;gap:var(--space-sm);font-size:13px;color:var(--text-secondary)">
            <span style="display:inline-flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:var(--success);display:inline-block"></span> ${allItems.filter(i => i.available).length} Available</span>
            <span style="display:inline-flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:var(--danger);display:inline-block"></span> ${allItems.filter(i => !i.available).length} Unavailable</span>
          </div>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="menu-category-tabs animate-fade-in stagger-1">
        ${menuCategories.map(cat => {
          const count = cat.id === 'all' ? allItems.length : allItems.filter(i => i.category === cat.id).length;
          return `
            <button class="menu-category-tab ${activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
              ${cat.emoji} ${cat.label} <span class="count">${count}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Menu Grid -->
      <div class="menu-grid animate-fade-in stagger-2">
        ${items.map(item => `
          <div class="menu-card" data-menu-id="${item.id}">
            <div class="menu-card-image">
              <span style="font-size:56px">${item.emoji}</span>
              <div class="menu-card-availability">
                <div class="toggle ${item.available ? 'active' : ''}" data-toggle-id="${item.id}" title="Toggle availability"></div>
              </div>
            </div>
            <div class="menu-card-body">
              <div class="menu-card-category">${menuCategories.find(c => c.id === item.category)?.label || item.category}</div>
              <div class="menu-card-name">${item.name}</div>
              <div class="menu-card-desc">${item.description}</div>
              <div class="menu-card-tags">
                ${item.dietaryTags.map(tag => `
                  <span class="tag tag-dietary">${tag}</span>
                `).join('')}
              </div>
              <div class="menu-card-footer">
                <div class="menu-card-price">${formatCurrency(item.price)} <span>/plate</span></div>
                <div style="display:flex;align-items:center;gap:4px">
                  <span style="font-size:12px;color:${item.available ? 'var(--success)' : 'var(--danger)'};font-weight:600">
                    ${item.available ? '● Available' : '● Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      ${items.length === 0 ? `
        <div class="empty-state" style="margin-top:var(--space-xl)">
          <div class="empty-state-icon">🍽️</div>
          <div class="empty-state-title">No items in this category</div>
          <div class="empty-state-text">Select a different category or add new menu items.</div>
        </div>
      ` : ''}
    </div>
  `;
}

export function initMenuManagement() {
  // Category tabs
  document.querySelectorAll('.menu-category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategory = tab.dataset.category;
      const container = document.querySelector('.main-content');
      if (container) {
        container.innerHTML = renderMenuManagement();
        initMenuManagement();
      }
    });
  });

  // Availability toggles
  document.querySelectorAll('.toggle[data-toggle-id]').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = toggle.dataset.toggleId;
      store.toggleMenuItemAvailability(id);
      toggle.classList.toggle('active');

      const item = store.getMenuItems().find(m => m.id === id);
      if (item) {
        toast.info(
          item.available ? 'Item Available' : 'Item Unavailable',
          `${item.name} is now ${item.available ? 'available' : 'unavailable'}`
        );
      }

      // Refresh to update counts
      setTimeout(() => {
        const container = document.querySelector('.main-content');
        if (container) {
          container.innerHTML = renderMenuManagement();
          initMenuManagement();
        }
      }, 300);
    });
  });
}
