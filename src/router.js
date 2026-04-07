// Simple hash-based SPA router
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.onNavigate = null;

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  addRoute(path, handler) {
    this.routes.set(path, handler);
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    let matched = false;

    for (const [path, handler] of this.routes) {
      // Check for parameterized routes like /orders/:id
      const paramPattern = path.replace(/:(\w+)/g, '([^/]+)');
      const regex = new RegExp(`^${paramPattern}$`);
      const match = hash.match(regex);

      if (match) {
        const paramNames = [...path.matchAll(/:(\w+)/g)].map(m => m[1]);
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });

        this.currentRoute = { path, hash, params };
        handler(params);
        matched = true;

        if (this.onNavigate) {
          this.onNavigate(this.currentRoute);
        }
        break;
      }
    }

    if (!matched) {
      // Fallback to dashboard
      window.location.hash = '#/';
    }
  }

  navigate(path) {
    window.location.hash = `#${path}`;
  }

  getCurrentPath() {
    return window.location.hash.slice(1) || '/';
  }
}

export const router = new Router();
