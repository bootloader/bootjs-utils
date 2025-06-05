class Ury {
  constructor(url) {
    if (!url || typeof url !== "string") {
      throw new TypeError("Ury requires a URL string");
    }

    // Add default protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }

    const parsed = new URL(url);

    this.href = parsed.href;
    this.protocol = parsed.protocol;
    this.username = parsed.username;
    this.password = parsed.password;
    this.host = parsed.host;
    this.hostname = parsed.hostname;
    this.port = parsed.port;
    this.pathname = parsed.pathname;
    this.search = parsed.search;
    this.hash = parsed.hash;
    this.queryParams = Object.fromEntries(parsed.searchParams.entries());
  }

  get subdomain() {
    const parts = this.hostname.split(".");
    return parts.length > 2 ? parts.slice(0, -2).join(".") : null;
  }

  toJSON() {
    return {
      href: this.href,
      protocol: this.protocol,
      username: this.username,
      password: this.password,
      host: this.host,
      hostname: this.hostname,
      port: this.port,
      pathname: this.pathname,
      search: this.search,
      hash: this.hash,
      queryParams: this.queryParams,
      subdomain: this.subdomain
    };
  }
}
