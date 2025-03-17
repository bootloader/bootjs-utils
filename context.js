const { AsyncLocalStorage } = require('async_hooks');

const request = require('./request');

const crypto = require('crypto');

class Context {
  constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage();
  }

  /** Starts a new context for the request */
  run(fn) {
    this.asyncLocalStorage.run(new Map(), fn);
  }

  useDefaults({ tenant = '~~~', traceId }) {
    this.setTenant(tenant);
    if (!traceId) {
      traceId = crypto.randomUUID();
    }
    this.setTraceId(traceId);
    return { tenant, traceId };
  }

  start(...args) {
    let fun = args.find(arg => typeof arg == 'function') || (() => {});
    return (req, res, next) => {
      this.run(() => {
        let requestContext = request.context(req);
        let tenant = requestContext.headerOrParam('tnt');
        let traceId = requestContext.headerOrParam('x-trace-id');
        fun(this.useDefaults({ tenant, traceId }));
        next();
      });
    };
  }

  withRequest(callback) {
    return this.start(callback);
  }

  init(...args) {
    let fun = args.find(arg => typeof arg == 'function') || (() => {});
    let options = args.find(arg => arg == 'object') || {};
    this.run(() => {
      fun(this.useDefaults(options));
    });
  }

  /** Set a value in the current request context */
  set(key, value) {
    const store = this.asyncLocalStorage.getStore();
    if (store) store.set(key, value);
  }

  /** Get a value from the current request context */
  get(key) {
    const store = this.asyncLocalStorage.getStore();
    return store ? store.get(key) : undefined;
  }

  /** Set the Trace ID */
  setTraceId(traceId) {
    this.set('traceId', traceId);
  }

  /** Get the Trace ID */
  getTraceId() {
    return this.get('traceId');
  }

  /** Set the Tenant ID */
  setTenant(tenant) {
    this.set('tenant', tenant);
  }

  /** Get the Tenant ID */
  getTenant() {
    return this.get('tenant');
  }
}

// Export a singleton instance
module.exports = new Context();
