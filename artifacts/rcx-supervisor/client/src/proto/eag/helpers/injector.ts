/* PROTOTYPE STUB — replaces the AngularJS injector bridge (no angular).
 * Returns a catch-all proxy so any `injector('Svc').anyMethod()` chain is a safe
 * no-op during standalone rendering. `$`-prefixed props return STABLE
 * BehaviorSubject-like stubs (cached) so useSyncExternalStore doesn't loop. */
const subj = (val: any): any => ({
  getValue: () => val,
  subscribe: (cb: any) => {
    try {
      cb && cb(val);
    } catch (e) {
      /* noop */
    }
    return { unsubscribe() {} };
  },
  next() {},
  pipe: () => subj(val),
  asObservable: () => subj(val),
});

const makeProxy = (): any => {
  const cache: Record<string, any> = {};
  return new Proxy(function () {}, {
    get: (_t, k) => {
      if (typeof k === 'string' && k.charAt(0) === '$') {
        if (!(k in cache)) {
          cache[k] =
            k.toLowerCase().indexOf('monitoredagent') !== -1
              ? subj(new Set())
              : subj(false);
        }
        return cache[k];
      }
      return makeProxy();
    },
    apply: () => null,
    construct: () => makeProxy(),
  });
};

// Categories used by the Interactions "Categories" column (CategoriesCell).
// color must be a TagColor enum value (BLUE/GREEN/TURQUOISE/PURPLE/ORANGE/RED/GREY)
export const CATEGORIES_MAP: Record<string, { id: string; name: string; color: string }> = {
  '1': { id: '1', name: 'Billing', color: 'BLUE' },
  '2': { id: '2', name: 'Refund', color: 'GREEN' },
  '3': { id: '3', name: 'Technical', color: 'ORANGE' },
  '4': { id: '4', name: 'VIP', color: 'PURPLE' },
  '5': { id: '5', name: 'Escalation', color: 'RED' },
  '6': { id: '6', name: 'Feedback', color: 'TURQUOISE' },
};

// Concrete stubs for the few Angular services whose return values are actually
// rendered (CategoriesCell). Unknown props fall back to the no-op proxy.
// Stable singletons — returning fresh objects/arrays each call invalidates
// CategoriesCell's useMemo every render and causes an update-depth loop.
const PRIORITY_SETTINGS = { priorityCategories: {} as Record<string, unknown> };
const SORTED_IDS: string[] = [];
const CONCRETE: Record<string, any> = {
  CategoriesSvc: { getCategoriesMap: () => CATEGORIES_MAP },
  DashboardSvc: {
    getPriorityCategoriesSettings: () => PRIORITY_SETTINGS,
  },
  PriorityCategoriesNotificationSvc: { getSortedCategoryIds: () => SORTED_IDS },
};

// Cache one stable proxy per service name (injector() is called inside render).
const serviceProxies: Record<string, any> = {};
export default function injector(service = '__default__'): any {
  if (!(service in serviceProxies)) {
    const concrete = CONCRETE[service];
    serviceProxies[service] = concrete
      ? new Proxy(concrete, {
          get: (t: any, k: string) => (k in t ? t[k] : makeProxy()),
        })
      : makeProxy();
  }
  return serviceProxies[service];
}

