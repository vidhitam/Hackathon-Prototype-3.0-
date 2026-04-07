// Realistic seed data generator for OMS
import { menuItems } from './menu-items.js';

const channels = ['phone', 'whatsapp', 'email', 'website'];
const statuses = ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

const customerData = [
  { name: 'Rajesh Kumar', company: 'TCS Ltd', phone: '+91-9876543210', email: 'rajesh.kumar@tcs.com', preferredChannel: 'phone' },
  { name: 'Priya Sharma', company: 'Infosys', phone: '+91-9845123456', email: 'priya.sharma@infosys.com', preferredChannel: 'whatsapp' },
  { name: 'Amit Patel', company: 'Wipro Technologies', phone: '+91-9723456789', email: 'amit.patel@wipro.com', preferredChannel: 'email' },
  { name: 'Sneha Reddy', company: 'HCL Tech', phone: '+91-9612345678', email: 'sneha.reddy@hcltech.com', preferredChannel: 'website' },
  { name: 'Mohammed Ali', company: 'Tech Mahindra', phone: '+91-9501234567', email: 'mohammed.ali@techmahindra.com', preferredChannel: 'whatsapp' },
  { name: 'Kavita Nair', company: 'Deloitte India', phone: '+91-9445678901', email: 'kavita.nair@deloitte.com', preferredChannel: 'phone' },
  { name: 'Rahul Verma', company: 'Accenture', phone: '+91-9334567890', email: 'rahul.verma@accenture.com', preferredChannel: 'email' },
  { name: 'Anita Desai', company: 'Cognizant', phone: '+91-9223456789', email: 'anita.desai@cognizant.com', preferredChannel: 'whatsapp' },
  { name: 'Vikram Singh', company: 'IBM India', phone: '+91-9112345678', email: 'vikram.singh@ibm.com', preferredChannel: 'website' },
  { name: 'Nisha Gupta', company: 'Amazon India', phone: '+91-9001234567', email: 'nisha.gupta@amazon.in', preferredChannel: 'phone' },
  { name: 'Suresh Iyer', company: 'Google India', phone: '+91-8890123456', email: 'suresh.iyer@google.com', preferredChannel: 'email' },
  { name: 'Pooja Mehta', company: 'Microsoft India', phone: '+91-8789012345', email: 'pooja.mehta@microsoft.com', preferredChannel: 'whatsapp' },
  { name: 'Deepak Joshi', company: 'Goldman Sachs', phone: '+91-8678901234', email: 'deepak.joshi@gs.com', preferredChannel: 'phone' },
  { name: 'Meera Krishnan', company: 'JP Morgan', phone: '+91-8567890123', email: 'meera.k@jpmorgan.com', preferredChannel: 'website' },
  { name: 'Arjun Malhotra', company: 'HDFC Bank', phone: '+91-8456789012', email: 'arjun.m@hdfcbank.com', preferredChannel: 'phone' }
];

const addresses = [
  'Tower A, Cybercity, DLF Phase 2, Gurugram',
  'Prestige Tech Park, Marathahalli, Bangalore',
  'Hinjwadi IT Park, Pune',
  'RMZ Infinity, Old Madras Road, Bangalore',
  'Mindspace, Hi-Tech City, Hyderabad',
  'Candor Tech Space, Noida Sector 135',
  'Embassy One, MG Road, Bangalore',
  'WeWork, BKC, Mumbai',
  'RMZ Ecoworld, Bellandur, Bangalore',
  'DLF IT Park, Manapakkam, Chennai',
  'Bagmane Tech Park, CV Raman Nagar, Bangalore',
  'Manyata Embassy Park, Hebbal, Bangalore'
];

const specialInstructions = [
  'Please ensure food is delivered hot. Use thermal bags.',
  'Need separate packaging for veg and non-veg items.',
  'Delivery to reception desk, 3rd floor, Wing B.',
  'Arrange buffet setup at the conference hall.',
  'No onion, no garlic variants for 10 out of 50 pax.',
  'Extra raita and pickles required.',
  'Please include disposable plates, cups, and cutlery.',
  'Jain food for 5 people — no root vegetables.',
  'Half sweet desserts for the diabetic guests.',
  'Need serving staff — 2 persons for 2 hours.',
  '',
  '',
  ''
];

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(prefix, num) {
  return `${prefix}-${String(num).padStart(4, '0')}`;
}

function randomDate(daysBack, daysForward = 0) {
  const now = new Date();
  const start = new Date(now.getTime() - daysBack * 86400000);
  const end = new Date(now.getTime() + daysForward * 86400000);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString();
}

export function generateCustomers() {
  return customerData.map((c, i) => ({
    id: generateId('CUST', i + 1),
    ...c,
    totalOrders: randomBetween(3, 25),
    totalSpend: randomBetween(15000, 350000),
    createdAt: formatDate(randomDate(180)),
    notes: ''
  }));
}

export function generateOrders(customers) {
  const orders = [];

  for (let i = 0; i < 32; i++) {
    const customer = randomFromArray(customers);
    const channel = i < 4 ? channels[i] : randomFromArray(channels); // Ensure at least one of each channel
    const numItems = randomBetween(2, 6);
    const selectedItems = [];
    const usedIds = new Set();

    for (let j = 0; j < numItems; j++) {
      let item;
      do {
        item = randomFromArray(menuItems);
      } while (usedIds.has(item.id));
      usedIds.add(item.id);

      const qty = randomBetween(5, 50);
      selectedItems.push({
        menuItemId: item.id,
        name: item.name,
        quantity: qty,
        unitPrice: item.price,
        notes: '',
        dietaryTags: item.dietaryTags
      });
    }

    const subtotal = selectedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = Math.round(subtotal * 0.18);
    const deliveryCharge = subtotal > 10000 ? 0 : 500;
    const total = subtotal + tax + deliveryCharge;

    const createdAt = randomDate(14, 0);
    const eventDate = new Date(createdAt.getTime() + randomBetween(1, 7) * 86400000);

    // Determine status based on event date
    let status;
    const now = new Date();
    if (i < 3) {
      status = 'new'; // Keep some new
    } else if (eventDate < now) {
      status = Math.random() > 0.1 ? 'delivered' : 'cancelled';
    } else {
      status = randomFromArray(['new', 'confirmed', 'preparing', 'ready']);
    }

    const timeline = [
      { action: 'Order created', timestamp: formatDate(createdAt), user: 'System' }
    ];

    if (['confirmed', 'preparing', 'ready', 'delivered'].includes(status)) {
      timeline.push({
        action: 'Order confirmed',
        timestamp: formatDate(new Date(createdAt.getTime() + randomBetween(10, 60) * 60000)),
        user: 'Admin'
      });
    }
    if (['preparing', 'ready', 'delivered'].includes(status)) {
      timeline.push({
        action: 'Kitchen started prep',
        timestamp: formatDate(new Date(eventDate.getTime() - randomBetween(3, 6) * 3600000)),
        user: 'Kitchen'
      });
    }
    if (['ready', 'delivered'].includes(status)) {
      timeline.push({
        action: 'Order ready for dispatch',
        timestamp: formatDate(new Date(eventDate.getTime() - randomBetween(1, 2) * 3600000)),
        user: 'Kitchen'
      });
    }
    if (status === 'delivered') {
      timeline.push({
        action: 'Order delivered',
        timestamp: formatDate(eventDate),
        user: 'Delivery'
      });
    }
    if (status === 'cancelled') {
      timeline.push({
        action: 'Order cancelled',
        timestamp: formatDate(new Date(createdAt.getTime() + randomBetween(30, 120) * 60000)),
        user: 'Admin'
      });
    }

    orders.push({
      id: generateId('ORD', 2026 * 100 + i + 1),
      channel,
      status,
      customer: {
        id: customer.id,
        name: customer.name,
        company: customer.company,
        phone: customer.phone,
        email: customer.email
      },
      items: selectedItems,
      eventDate: formatDate(eventDate),
      deliveryAddress: randomFromArray(addresses),
      headcount: randomBetween(20, 150),
      specialInstructions: randomFromArray(specialInstructions),
      subtotal,
      tax,
      deliveryCharge,
      total,
      timeline,
      createdAt: formatDate(createdAt),
      updatedAt: formatDate(new Date(createdAt.getTime() + randomBetween(10, 1440) * 60000))
    });
  }

  // Sort by createdAt descending
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return orders;
}
