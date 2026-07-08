/* PROTOTYPE STUB for the private @ringcx/pii-interceptor package.
 * CommonJS catch-all proxy — any import resolves to a safe no-op. */
const makeProxy = (): any =>
  new Proxy(function () {}, {
    get: (_t, p) => (p === '__esModule' ? true : makeProxy()),
    apply: () => makeProxy(),
    construct: () => makeProxy(),
  });

module.exports = new Proxy(
  { __esModule: true },
  { get: (t: any, p: string) => (p in t ? t[p] : makeProxy()) }
);
