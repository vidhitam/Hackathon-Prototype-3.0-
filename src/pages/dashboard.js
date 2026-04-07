// Dashboard Page
import { store } from '../store.js';
import { renderHeader } from '../components/sidebar.js';
import { channelConfig, statusConfig, formatCurrency, timeAgo, animateCounter } from '../components/utils.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let revenueChart = null;
let channelChart = null;

export function renderDashboard() {
  const stats = store.getStats();
  const recentOrders = store.getOrders().slice(0, 10);
  const upcomingDeliveries = store.getOrders()
    .filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status))
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    .slice(0, 5);

  return `
    ${renderHeader('Dashboard', 'Real-time overview')}
    <div class="page-content">
      <!-- KPI Stats -->
      <div class="dashboard-grid animate-fade-in">
        <div class="stat-card stagger-1 animate-fade-in-up">
          <div class="stat-card-header">
            <div class="stat-card-icon" style="background: var(--accent-primary-subtle); color: var(--accent-primary);">📦</div>
            <div class="stat-card-trend up">↑ 12% <span style="font-weight:400">vs yesterday</span></div>
          </div>
          <div class="stat-card-value" id="stat-today-orders" data-target="${stats.todayOrders}">0</div>
          <div class="stat-card-label">Today's Orders</div>
        </div>

        <div class="stat-card stagger-2 animate-fade-in-up">
          <div class="stat-card-header">
            <div class="stat-card-icon" style="background: var(--success-subtle); color: var(--success);">💰</div>
            <div class="stat-card-trend up">↑ 8%</div>
          </div>
          <div class="stat-card-value" id="stat-today-revenue" data-target="${stats.todayRevenue}">0</div>
          <div class="stat-card-label">Today's Revenue</div>
        </div>

        <div class="stat-card stagger-3 animate-fade-in-up">
          <div class="stat-card-header">
            <div class="stat-card-icon" style="background: var(--warning-subtle); color: var(--warning);">⏳</div>
            <div class="stat-card-trend ${stats.pendingOrders > 5 ? 'down' : 'up'}">${stats.pendingOrders > 5 ? '↑' : '↓'} ${stats.pendingOrders}</div>
          </div>
          <div class="stat-card-value" id="stat-pending" data-target="${stats.pendingOrders}">0</div>
          <div class="stat-card-label">Pending Orders</div>
        </div>

        <div class="stat-card stagger-4 animate-fade-in-up">
          <div class="stat-card-header">
            <div class="stat-card-icon" style="background: var(--accent-secondary-subtle); color: var(--accent-secondary);">📊</div>
            <div class="stat-card-trend up">↑ 3%</div>
          </div>
          <div class="stat-card-value" id="stat-total-orders" data-target="${stats.totalOrders}">0</div>
          <div class="stat-card-label">Total Orders</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="dashboard-charts animate-fade-in stagger-3">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Revenue Trend</div>
              <div class="card-subtitle">Last 7 days</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="revenue-chart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Orders by Channel</div>
              <div class="card-subtitle">Distribution</div>
            </div>
          </div>
          <div class="chart-container" style="height: 240px; display: flex; align-items: center; justify-content: center;">
            <canvas id="channel-chart"></canvas>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 12px;">
            ${Object.entries(channelConfig).map(([key, cfg]) => `
              <div style="display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-secondary);">
                <span>${cfg.icon}</span> ${cfg.label}: <strong style="color:var(--text-primary)">${stats.channelCounts[key] || 0}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="dashboard-bottom animate-fade-in stagger-5">
        <!-- Recent Orders -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Recent Orders</div>
              <div class="card-subtitle">Live feed</div>
            </div>
            <a href="#/orders" class="btn btn-ghost btn-sm">View All →</a>
          </div>
          <div class="live-feed">
            ${recentOrders.map(order => `
              <div class="live-feed-item" data-order-id="${order.id}" style="cursor:pointer">
                <div class="feed-channel-icon" style="background:${channelConfig[order.channel].bgColor}; color:${channelConfig[order.channel].color}">
                  ${channelConfig[order.channel].icon}
                </div>
                <div class="feed-order-info">
                  <div class="feed-order-id">${order.id} <span class="badge badge-status-${order.status}" style="font-size:10px; padding:2px 6px; margin-left:6px">${statusConfig[order.status].label}</span></div>
                  <div class="feed-order-customer">${order.customer.name} — ${order.customer.company}</div>
                </div>
                <div class="feed-order-meta">
                  <div class="feed-order-amount">${formatCurrency(order.total)}</div>
                  <div class="feed-order-time">${timeAgo(order.createdAt)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Upcoming Deliveries + Quick Actions -->
        <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Upcoming Deliveries</div>
                <div class="card-subtitle">Scheduled today & tomorrow</div>
              </div>
            </div>
            <div class="delivery-timeline">
              ${upcomingDeliveries.length ? upcomingDeliveries.map(order => {
                const eventDate = new Date(order.eventDate);
                const time = eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                return `
                  <div class="delivery-item">
                    <div class="delivery-time">${time}</div>
                    <div class="delivery-details">
                      <div class="delivery-customer">${order.customer.name}</div>
                      <div class="delivery-address">${order.deliveryAddress}</div>
                      <div class="delivery-items-count">${order.items.length} items · ${order.headcount} pax · <span class="badge badge-status-${order.status}" style="font-size:10px;padding:1px 6px">${statusConfig[order.status].label}</span></div>
                    </div>
                  </div>
                `;
              }).join('') : `
                <div class="empty-state" style="padding: var(--space-lg);">
                  <div class="empty-state-icon" style="font-size:36px">📭</div>
                  <div class="empty-state-text">No upcoming deliveries</div>
                </div>
              `}
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Quick Actions</div>
            </div>
            <div class="quick-actions">
              <a href="#/orders/new" class="quick-action-btn">
                <div class="quick-action-icon">➕</div>
                <div>
                  <div class="quick-action-text">New Order</div>
                  <div class="quick-action-sub">Capture order</div>
                </div>
              </a>
              <a href="#/customers" class="quick-action-btn">
                <div class="quick-action-icon" style="background:var(--success-subtle); color:var(--success)">👥</div>
                <div>
                  <div class="quick-action-text">Customers</div>
                  <div class="quick-action-sub">Manage clients</div>
                </div>
              </a>
              <a href="#/menu" class="quick-action-btn">
                <div class="quick-action-icon" style="background:var(--warning-subtle); color:var(--warning)">🍽️</div>
                <div>
                  <div class="quick-action-text">Menu</div>
                  <div class="quick-action-sub">Edit catalog</div>
                </div>
              </a>
              <a href="#/analytics" class="quick-action-btn">
                <div class="quick-action-icon" style="background:var(--info-subtle); color:var(--info)">📈</div>
                <div>
                  <div class="quick-action-text">Reports</div>
                  <div class="quick-action-sub">View analytics</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initDashboard() {
  // Animate counters
  setTimeout(() => {
    const elements = [
      { el: document.getElementById('stat-today-orders'), prefix: '' },
      { el: document.getElementById('stat-today-revenue'), prefix: '₹' },
      { el: document.getElementById('stat-pending'), prefix: '' },
      { el: document.getElementById('stat-total-orders'), prefix: '' }
    ];

    elements.forEach(({ el, prefix }) => {
      if (el) {
        const target = parseInt(el.dataset.target);
        animateCounter(el, target);
        if (prefix) {
          const origUpdate = el.textContent;
          const observer = new MutationObserver(() => {
            if (!el.textContent.startsWith(prefix)) {
              el.textContent = prefix + el.textContent;
            }
          });
          observer.observe(el, { childList: true, characterData: true, subtree: true });
          el.textContent = prefix + '0';
        }
      }
    });
  }, 200);

  // Init charts
  initRevenueChart();
  initChannelChart();

  // Feed click handlers
  document.querySelectorAll('.live-feed-item[data-order-id]').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.orderId;
      window.location.hash = `#/orders/${id}`;
    });
  });
}

function initRevenueChart() {
  const ctx = document.getElementById('revenue-chart');
  if (!ctx) return;

  if (revenueChart) revenueChart.destroy();

  const stats = store.getStats();

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: stats.revenueByDay.map(d => d.label),
      datasets: [{
        label: 'Revenue',
        data: stats.revenueByDay.map(d => d.revenue),
        borderColor: 'hsl(258, 90%, 66%)',
        backgroundColor: 'hsla(258, 90%, 66%, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(258, 90%, 66%)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8
      }, {
        label: 'Orders',
        data: stats.revenueByDay.map(d => d.orders * 5000),
        borderColor: 'hsl(175, 80%, 50%)',
        backgroundColor: 'hsla(175, 80%, 50%, 0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        borderDash: [5, 5]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: 'hsl(228, 15%, 60%)',
            usePointStyle: true,
            padding: 16,
            font: { family: 'Inter', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'hsl(228, 20%, 16%)',
          titleColor: 'hsl(0, 0%, 95%)',
          bodyColor: 'hsl(228, 15%, 60%)',
          borderColor: 'hsla(228, 15%, 40%, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' },
          callbacks: {
            label: (ctx) => {
              if (ctx.datasetIndex === 0) return ` Revenue: ₹${ctx.raw.toLocaleString('en-IN')}`;
              return ` Orders: ${Math.round(ctx.raw / 5000)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'hsla(228, 15%, 40%, 0.1)' },
          ticks: { color: 'hsl(228, 15%, 60%)', font: { family: 'Inter', size: 11 } }
        },
        y: {
          grid: { color: 'hsla(228, 15%, 40%, 0.1)' },
          ticks: {
            color: 'hsl(228, 15%, 60%)',
            font: { family: 'Inter', size: 11 },
            callback: (v) => '₹' + (v / 1000).toFixed(0) + 'K'
          }
        }
      }
    }
  });
}

function initChannelChart() {
  const ctx = document.getElementById('channel-chart');
  if (!ctx) return;

  if (channelChart) channelChart.destroy();

  const stats = store.getStats();
  const labels = Object.keys(channelConfig).map(k => channelConfig[k].label);
  const data = Object.keys(channelConfig).map(k => stats.channelCounts[k] || 0);
  const colors = [
    'hsl(258, 90%, 66%)',
    'hsl(142, 70%, 45%)',
    'hsl(210, 80%, 55%)',
    'hsl(38, 95%, 55%)'
  ];

  channelChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: 'hsl(228, 20%, 14%)',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'hsl(228, 20%, 16%)',
          titleColor: 'hsl(0, 0%, 95%)',
          bodyColor: 'hsl(228, 15%, 60%)',
          borderColor: 'hsla(228, 15%, 40%, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' }
        }
      }
    }
  });
}
