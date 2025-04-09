// ensure.js

class MissingParamsError extends Error {
  constructor(missingParams, { type }) {
    super(`Missing ${type}${missingParams.length > 1 ? 's' : ''}`);
    this.name = 'MissingParamsError';
    this.missing = missingParams;
  }
}

class Validator {
  constructor(params, options = {}) {
    this.params = params;
    this.options = options;
  }
  required() {
    const missing = [];
    const type = this.options?.type || 'value';

    for (const [key, value] of Object.entries(this.params)) {
      if (value === undefined || value === null || value === '') {
        missing.push({ key, type });
      }
    }

    if (missing.length > 0) {
      throw new MissingParamsError(missing, { type });
    }
    return this.params;
  }
}

const ensure = {
  MissingParamsError,
  values(params) {
    return new Validator(params, { type: 'value' });
  },
  params(params) {
    return new Validator(params, { type: 'param' });
  },
};

module.exports = ensure;
