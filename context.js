const { AsyncLocalStorage } = require("async_hooks");

const request = require("./request");

class Context {
  constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage();
  }

  /** Starts a new context for the request */
  run(fn) {
    this.asyncLocalStorage.run(new Map(), fn);
  }

  start() {
    return (req, res, next) => {
      this.run(() => {
        let requestContext = request.context(req);
        let siteId = requestContext.headerOrParam("tnt");
        this.setTenant(siteId);

        let traceId = requestContext.headerOrParam("x-trace-id");
        this.setTraceId(traceId);
        next();
      });
    };
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
    this.set("traceId", traceId);
  }

  /** Get the Trace ID */
  getTraceId() {
    return this.get("traceId");
  }

  /** Set the Tenant ID */
  setTenant(tenant) {
    this.set("tenant", tenant);
  }

  /** Get the Tenant ID */
  getTenant() {
    return this.get("tenant");
  }
}

// Export a singleton instance
module.exports = new Context();
