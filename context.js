const { AsyncLocalStorage } = require('async_hooks');

const request = require('./request');

import crypto from 'crypto';

class Context {
  constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage();
  }

  /** Starts a new context for the request */
  run(fn) {
    this.asyncLocalStorage.run(new Map(), fn);
  }

  useDefaults({ tenant, traceId }) {
    if (!tenant) {
      tenant = '---';
      this.setTenant(tenant);
    }
    if (!traceId) {
      traceId = crypto.randomUUID();
      this.setTraceId(traceId);
    }
    return { tenant, traceId };
  }

  start(callback) {
    return (req, res, next) => {
      this.run(() => {
        let requestContext = request.context(req);
        let tenant = requestContext.headerOrParam('tnt');
        this.setTenant(tenant);
        let traceId = requestContext.headerOrParam('x-trace-id');
        if (typeof callback == 'function') {
          callback({ traceId, tenant, requestContext, req, res });
        }
        this.useDefaults({ traceId, tenant });
        next();
      });
    };
  }

  withRequest(callback) {
    return this.start(callback);
  }

  init(options = {}) {
    this.run(() => {
      this.useDefaults(options);
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
