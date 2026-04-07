// Centralized State Management with localStorage persistence
import { generateCustomers, generateOrders } from './data/seed.js';
import { menuItems as menuCatalog } from './data/menu-items.js';

const STORAGE_KEY = 'caterflow_oms_data';
const VERSION = '1.0.0';

class Store {
  constructor() {
    this.listeners = new Map();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === VERSION) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }

    // Initialize with seed data
    return this.seedState();
  }

  seedState() {
    const customers = generateCustomers();
    const orders = generateOrders(customers);
    const state = {
      version: VERSION,
      orders,
      customers,
      menuItems: menuCatalog.map(item => ({ ...item })),
      settings: {
        currency: '₹',
        taxRate: 0.18,
        businessName: 'CaterFlow',
        freeDeliveryMin: 10000,
        deliveryCharge: 500
      }
    };

    this.saveState(state);
    return state;
  }

  saveState(state = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const cbs = this.listeners.get(event);
      const idx = cbs.indexOf(callback);
      if (idx > -1) cbs.splice(idx, 1);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  // Orders
  getOrders(filters = {}) {
    let orders = [...this.state.orders];

    if (filters.channel) {
      orders = orders.filter(o => o.channel === filters.channel);
    }
    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.company.toLowerCase().includes(q)
      );
    }
    if (filters.dateFrom) {
      orders = orders.filter(o => new Date(o.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      orders = orders.filter(o => new Date(o.createdAt) <= new Date(filters.dateTo));
    }

    return orders;
  }

  getOrder(id) {
    return this.state.orders.find(o => o.id === id);
  }

  addOrder(order) {
    const id = `ORD-${new Date().getFullYear()}-${String(this.state.orders.length + 1).padStart(4, '0')}`;
    const newOrder = {
      ...order,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { action: 'Order created', timestamp: new Date().toISOString(), user: 'Admin' }
      ]
    };
    this.state.orders.unshift(newOrder);
    this.saveState();
    this.emit('orderAdded', newOrder);
    this.emit('ordersChanged', this.state.orders);
    return newOrder;
  }

  updateOrderStatus(id, status) {
    const order = this.state.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      const actionLabels = {
        confirmed: 'Order confirmed',
        preparing: 'Kitchen started prep',
        ready: 'Order ready for dispatch',
        delivered: 'Order delivered',
        cancelled: 'Order cancelled'
      };
      order.timeline.push({
        action: actionLabels[status] || `Status changed to ${status}`,
        timestamp: new Date().toISOString(),
        user: 'Admin'
      });
      this.saveState();
      this.emit('orderUpdated', order);
      this.emit('ordersChanged', this.state.orders);
    }
    return order;
  }

  deleteOrder(id) {
    this.state.orders = this.state.orders.filter(o => o.id !== id);
    this.saveState();
    this.emit('ordersChanged', this.state.orders);
  }

  // Customers
  getCustomers(search = '') {
    let customers = [...this.state.customers];
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return customers;
  }

  getCustomer(id) {
    return this.state.customers.find(c => c.id === id);
  }

  getCustomerOrders(customerId) {
    return this.state.orders.filter(o => o.customer.id === customerId);
  }

  addCustomer(customer) {
    const id = `CUST-${String(this.state.customers.length + 1).padStart(4, '0')}`;
    const newCustomer = {
      ...customer,
      id,
      totalOrders: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString()
    };
    this.state.customers.push(newCustomer);
    this.saveState();
    this.emit('customersChanged', this.state.customers);
    return newCustomer;
  }

  // Menu
  getMenuItems(category = 'all') {
    if (category === 'all') return [...this.state.menuItems];
    return this.state.menuItems.filter(m => m.category === category);
  }

  toggleMenuItemAvailability(id) {
    const item = this.state.menuItems.find(m => m.id === id);
    if (item) {
      item.available = !item.available;
      this.saveState();
      this.emit('menuChanged', this.state.menuItems);
    }
  }

  // Analytics Helpers
  getStats() {
    const orders = this.state.orders;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const pendingOrders = orders.filter(o => ['new', 'confirmed', 'preparing', 'ready'].includes(o.status));

    const todayRevenue = todayOrders.reduce((sum, o) => {
      if (o.status !== 'cancelled') return sum + o.total;
      return sum;
    }, 0);

    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);

    const channelCounts = {};
    channels.forEach(ch => {
      channelCounts[ch] = orders.filter(o => o.channel === ch).length;
    });

    const revenueByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= date && d < nextDate && o.status !== 'cancelled';
      });

      revenueByDay.push({
        date: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length
      });
    }

    // Top selling items
    const itemSales = {};
    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemSales[item.name].quantity += item.quantity;
        itemSales[item.name].revenue += item.quantity * item.unitPrice;
      });
    });
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    return {
      todayOrders: todayOrders.length,
      totalOrders: orders.length,
      todayRevenue,
      totalRevenue,
      pendingOrders: pendingOrders.length,
      channelCounts,
      revenueByDay,
      topItems,
      avgOrderValue: deliveredOrders.length ? Math.round(totalRevenue / deliveredOrders.length) : 0,
      completionRate: orders.length ? Math.round((deliveredOrders.length / orders.length) * 100) : 0,
      cancelRate: orders.length ? Math.round((orders.filter(o => o.status === 'cancelled').length / orders.length) * 100) : 0,
      repeatCustomerRate: 68 // Simulated
    };
  }

  // Reset
  resetData() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.seedState();
    this.emit('ordersChanged', this.state.orders);
    this.emit('customersChanged', this.state.customers);
    this.emit('menuChanged', this.state.menuItems);
  }
}

const channels = ['phone', 'whatsapp', 'email', 'website'];

export const store = new Store();
