const { AsyncLocalStorage } = require('async_hooks');

const request = require('./request');

const crypto = require('crypto');

const info = {
  id: 0,
};

class Context {
  constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage();
  }

  /** Starts a new context for the request */
  run(fn) {
    if (this.asyncLocalStorage.getStore()) {
      return fn(); // Continue using the existing context
    }
    let mp = new Map();
    mp.set('_:id', info.id++);
    return this.asyncLocalStorage.run(mp, async () => {
      return await fn(); // Ensure the async function executes within the context
    });
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
      this.run(async () => {
        let requestContext = request.context(req);
        let tenant = requestContext.headerOrParam('tnt');
        let traceId = requestContext.headerOrParam('x-trace-id');
        await fun(this.useDefaults({ tenant, traceId }));
        next();
      });
    };
  }

  withRequest(callback) {
    return this.start(callback);
  }

  init(...args) {
    let fun = args.find(arg => typeof arg == 'function') || (() => {});
    let options = args.find(arg => typeof arg == 'object') || {};
    return this.run(async () => {
      await fun(this.useDefaults(options));
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
    this.set('_:traceId', traceId);
  }

  /** Get the Trace ID */
  getTraceId() {
    return this.get('_:traceId');
  }

  /** Set the Tenant ID */
  setTenant(tenant) {
    this.set('_:tenant', tenant);
  }

  /** Get the Tenant ID */
  getTenant() {
    return this.get('_:tenant');
  }

  /** Get the ID */
  getId() {
    return this.get('_:id');
  }

  /** Set the Tenant ID */
  setId(id) {
    this.set('_:id', id);
  }

  toMap() {
    let tenant = this.getTenant();
    let traceId = this.getTraceId();
    let id = this.getId();
    return { tenant, traceId, id };
  }

  fromMap(context, fn) {
    this.setTenant(context.tenant);
    this.setTraceId(context.traceId);
    this.setId(context.id);
    //this.asyncLocalStorage.enterWith(store);
  }

  debug() {
    const store = this.asyncLocalStorage.getStore();
    console.log('Context Store:', store ? Object.fromEntries(store) : 'No active context');
  }
}

// Export a singleton instance
module.exports = new Context();
