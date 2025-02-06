class Request {
  constructor(req) {
    this.req = req;
  }
  header(key) {
    return this.req.header(key);
  }
  param(key) {
    // Set default values
    let traceId;

    //Check in query params
    if (traceId === undefined) {
      traceId = this.req.query?.[key];
    }

    // Check in cookies
    if (traceId === undefined) {
      traceId = this.req.cookies?.[key];
    }
    // Check in headers
    if (traceId === undefined) {
      traceId = this.req.header(key);
    }

    return traceId;
  }
  headerOrParam(key) {
    return this.header(key) || this.param(key);
  }

  static context(req) {
    return new Request(req);
  }
}
// Export a singleton instance
module.exports = Request;
