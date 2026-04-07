// CaterFlow OMS — Main Entry Point
import './styles/index.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/orders.css';
import './styles/new-order.css';
import './styles/customers.css';
import './styles/menu.css';
import './styles/analytics.css';

import { router } from './router.js';
import { store } from './store.js';
import { renderSidebar, updateActiveLink } from './components/sidebar.js';
import { toast } from './components/toast.js';

import { renderDashboard, initDashboard } from './pages/dashboard.js';
import { renderOrders, initOrders } from './pages/orders.js';
import { renderNewOrder, initNewOrder } from './pages/new-order.js';
import { renderOrderDetail, initOrderDetail } from './pages/order-detail.js';
import { renderCustomers, initCustomers } from './pages/customers.js';
import { renderMenuManagement, initMenuManagement } from './pages/menu-management.js';
import { renderAnalytics, initAnalytics } from './pages/analytics.js';

// App initialization
function initApp() {
  const app = document.getElementById('app');
  toast.init();

  // Build layout
  function renderPage(contentHTML) {
    app.innerHTML = `
      <div class="app-layout">
        ${renderSidebar()}
        <main class="main-content">
          ${contentHTML}
        </main>
      </div>
    `;
    updateActiveLink();
    bindGlobalEvents();
  }

  // Routes
  router.addRoute('/', () => {
    renderPage(renderDashboard());
    initDashboard();
  });

  router.addRoute('/orders', () => {
    renderPage(renderOrders());
    initOrders();
  });

  router.addRoute('/orders/new', () => {
    renderPage(renderNewOrder());
    initNewOrder();
  });

  router.addRoute('/orders/:id', (params) => {
    renderPage(renderOrderDetail(params));
    initOrderDetail(params);
  });

  router.addRoute('/customers', () => {
    renderPage(renderCustomers());
    initCustomers();
  });

  router.addRoute('/menu', () => {
    renderPage(renderMenuManagement());
    initMenuManagement();
  });

  router.addRoute('/analytics', () => {
    renderPage(renderAnalytics());
    initAnalytics();
  });

  // Navigation callback to update active links
  router.onNavigate = () => {
    updateActiveLink();
  };
}

function bindGlobalEvents() {
  // Global search
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) {
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = globalSearch.value.trim();
        if (q) {
          window.location.hash = '#/orders';
          setTimeout(() => {
            const filterSearch = document.getElementById('filter-search');
            if (filterSearch) {
              filterSearch.value = q;
              filterSearch.dispatchEvent(new Event('input'));
            }
          }, 100);
        }
      }
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      store.resetData();
      toast.success('Data Refreshed', 'All data has been regenerated with fresh seed data');
      router.handleRoute();
    });
  }

  // Notification button
  const notifBtn = document.getElementById('btn-notifications');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      const newOrders = store.getOrders({ status: 'new' });
      if (newOrders.length > 0) {
        toast.info(`${newOrders.length} New Orders`, 'You have pending orders that need attention');
      } else {
        toast.success('All Caught Up!', 'No pending notifications');
      }
      // Remove dot
      const dot = notifBtn.querySelector('.notification-dot');
      if (dot) dot.style.display = 'none';
    });
  }
}

// Boot
initApp();
