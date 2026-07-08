/* PROTOTYPE STUB for the private @ringcentral/web-modules-core package.
 * Pure CommonJS so esbuild treats it as CJS and any named import resolves via
 * the proxy. Unknown symbols return a harmless React component, so anything used
 * as a component (e.g. <Loader/>) still renders. */
const React = require('react');

const Stub = (props: any) =>
  React.createElement(React.Fragment, null, props && props.children);

const Loader = () =>
  React.createElement(
    'span',
    { className: 'rc-loader', style: { color: '#A1A1A1' } },
    '…'
  );

module.exports = new Proxy(
  { __esModule: true, Loader, default: Stub },
  { get: (t: any, p: string) => (p in t ? t[p] : Stub) }
);
