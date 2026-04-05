/**
 * Observer pattern — central hub for domain events (invoice created, payment recorded).
 * @singleton
 */
class NotificationService {
  constructor() {
    this.handlers = new Map();
  }

  on(event, handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event).push(handler);
  }

  async emit(event, payload) {
    const list = this.handlers.get(event) || [];
    for (const fn of list) {
      await fn(payload);
    }
  }
}

module.exports = new NotificationService();
