/* PROTOTYPE STUB for @ringcx/shared — explicit ESM named exports (esbuild needs
 * them statically). Render-critical symbols are concrete; the rest are no-ops. */

const noop: any = (..._a: any[]) => undefined;
export const Session: any = { isEmbeddedAgentClientAppType: () => false, isEmbeddedServiceWebAdminClientAppType: () => false, isSWIframe: () => false, isI18nEnabled: () => false, getUserDetails: () => ({}), clearSession: () => {} };
// --- REAL searchFiltration (vendored verbatim from libs/shared/.../filtration.ts,
// lodash cloneDeep swapped for structuredClone). Drives all table filtering:
// search box + state/channel/category multi-select filters. ---
const SEPARATOR_CONSTANT = '♦';
const _clone = <T>(v: T): T =>
  typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));
const _validateValue = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
export const getValueByPath = (path: string[], item: any): any => {
  if (path.length === 0) return item;
  return path.reduce<unknown>((result: any, key) => {
    if (result === null || result === undefined) return undefined;
    if (Array.isArray(result)) {
      return result.reduce<string[]>((acc, subResult) => {
        if (_validateValue(subResult[key])) acc.push(String(subResult[key]));
        return acc;
      }, []);
    }
    if (typeof result === 'object' && result !== null) {
      const record = result as Record<string, unknown>;
      if (_validateValue(record[key])) return String(record[key]);
      if (record[key]) return record[key];
    }
    return undefined;
  }, item);
};
const _transformIndex = (index: unknown[]) =>
  `${SEPARATOR_CONSTANT}${index.join(SEPARATOR_CONSTANT).toUpperCase()}${SEPARATOR_CONSTANT}`;
const _getIndexMap = (columns: string[][], dataSource: any[], outerIndexMap?: WeakMap<any, string>) => {
  const indexMap = new WeakMap<any, string>();
  for (const item of dataSource) {
    const index: string[] = [];
    for (const path of columns) {
      const [currentPath] = path;
      if (currentPath) {
        const currentValue = getValueByPath([currentPath], item);
        if (Array.isArray(currentValue)) {
          const pathValues = getValueByPath(path, item);
          if (Array.isArray(pathValues)) index.push(...pathValues);
          const newColumns = columns.reduce((acc: string[][], column) => {
            const [, ...rest] = column;
            if (rest.length) acc.push(rest);
            return acc;
          }, []);
          const validItems = (currentValue as unknown[]).filter(
            (v): v is any => v !== null && typeof v === 'object' && !Array.isArray(v)
          );
          if (validItems.length) _getIndexMap(newColumns, validItems, indexMap);
        } else {
          const indexValue = getValueByPath(path, item);
          if (indexValue && typeof indexValue === 'string') index.push(indexValue);
        }
      }
    }
    const mapEntry = _transformIndex(index);
    if (outerIndexMap) outerIndexMap.set(item, mapEntry);
    else indexMap.set(item, mapEntry);
  }
  return indexMap;
};
const _getVerifyingQueries = (searchValue: string | string[], isExact: boolean) => {
  if (searchValue && searchValue.length) {
    return (typeof searchValue === 'string' ? [searchValue] : searchValue).map((value) => {
      const query = value.toUpperCase();
      return isExact ? `${SEPARATOR_CONSTANT}${query}${SEPARATOR_CONSTANT}` : `${query}`;
    });
  }
  return;
};
const _filterDataSource = (
  dataSource: any[],
  columns: string[][],
  indexMap: WeakMap<any, string>,
  verifyingQuery: string[],
  shallow = false
): any[] => {
  const res = dataSource.filter((item) => {
    const indexString = indexMap.get(item);
    if (!indexString) return false;
    for (const query of verifyingQuery) if (indexString.indexOf(query) !== -1) return true;
    return false;
  });
  if (shallow) return res;
  return res.reduce((acc: any[], item) => {
    const itemClone = _clone(item);
    for (const [key, value] of Object.entries(item)) {
      const isKeyUsed = columns.some((path) => Array.from(path).includes(key));
      if (Array.isArray(value) && value.length && isKeyUsed) {
        itemClone[key] = _filterDataSource(value, columns, indexMap, verifyingQuery);
      }
    }
    acc.push(itemClone);
    return acc;
  }, []);
};
export const searchFiltration: any = (
  data: any[],
  columns: string[][],
  searchValue: string | string[],
  strict = false,
  shallow = false
) => {
  if (!Array.isArray(data)) return [];
  const indexMap = _getIndexMap(columns, data);
  const verifyingQuery = _getVerifyingQueries(searchValue, strict);
  if (!verifyingQuery) return data;
  return _filterDataSource(data, columns, indexMap, verifyingQuery, shallow);
};
export const FfsService: any = {
  instance: () => ({
    // enable the change-agent-state flag so the More(⋮) "Update agent state" option shows
    getFeatureFlag: async () => ({
      flags: { 'change-agent-state-availability': true },
    }),
  }),
};
export const Languages: any = { EN_US: "en-US", ZH_CN: "zh-CN", RC_XX: "rc-XX", RC_LS: "rc-LS" };
export const getUserLocale: any = () => "en";
export const getLanguageFileName: any = () => "en-US";
export const isSWIframe: any = () => false;
export const parsePhoneNumber: any = (v: any) => ({ value: v, isValid: true });
const fmtDuration = (ms: number) => {
  const t = Math.max(0, Math.floor((ms || 0) / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`;
};
const durObj = (totalMs: number) => {
  const str = fmtDuration(totalMs);
  return { toFormat: () => str, toHuman: () => str };
};
export const DateTime: any = {
  fromMillis: (n: number) => ({ toFormat: () => fmtDuration(n), toISO: () => "", isValid: true }),
  now: () => ({ setZone: () => ({ offset: 0 }), toFormat: () => "", toISO: () => "" }),
  fromSQLToDateTime: () => ({ isValid: false }),
  localizedDateTimeFromObject: () => "",
  // luxon-like Duration used by the time-formatting helpers
  Duration: {
    fromMillis: (ms: number) => durObj(ms),
    fromObject: (o: any) =>
      durObj(
        ((o?.seconds || 0) * 1000) +
          ((o?.minutes || 0) * 60000) +
          ((o?.hours || 0) * 3600000)
      ),
  },
  // format-preset enums: any key -> a usable format string
  DURATION_FORMAT: new Proxy({}, { get: (_t, k) => String(k) }),
  DATETIME_FORMAT: new Proxy({}, { get: (_t, k) => String(k) }),
};
export const CHANGE_AGENT_STATE_AVAILABILITY_FLAG: any = "change-agent-state-availability";
export const AGENT_ASSIST_AI_FEATURES_FLAG: any = noop;
export const AGENT_ASSIST_DIGITAL_CHANNEL_FLAG: any = noop;
export const Analytics: any = noop;
export const AppVersionComparison: any = noop;
export const BrandRedirect: any = noop;
export const CUSTOMER_SUPPORT_LINK: any = noop;
export const DEFAULT_AT_T_LINK: any = noop;
export const DigitalJWTModifier: any = noop;
export const EAG_UNSUPPORTED_BROWSERS: any = noop;
export const EAlgorithmType: any = noop;
export const EAuthType: any = noop;
export const EClientCredentialsSupplyIn: any = noop;
export const EGrantType: any = noop;
export const EJWTDestination: any = noop;
export const NOVA_AGENT_ASSIST_PORTAL_ACCESS_FLAG: any = noop;
export const Navigation: any = noop;
export const ONLINE_TRAINING_LINK: any = noop;
export const PHONE_DELIMETER: any = noop;
export const PRIVACY_NOTICE: any = noop;
export const ProductType: any = noop;
export const ProviderTypes: any = noop;
export const RC_SUBMIT_AN_IDEA: any = noop;
export const TERMS_OF_SERVICE: any = noop;
export const USA_COUNTRY_ID: any = noop;
export const UserService: any = noop;
export const WHATS_NEW_LINK: any = noop;
export const clearPhoneNumberFromSymbols: any = noop;
export const createModuleClosure: any = noop;
export const formatOutboundVoicemailAgentNotes: any = noop;
export const getAnalyticsCookieDomain: any = noop;
export const getAnalyticsToken: any = noop;
export const getBrowserInfo: any = noop;
export const i18nCustomPluralRule: any = noop;
export const isBiz: any = noop;
export const isEmail: any = noop;
export const isReportAnIssueAvailable: any = noop;
export const isValidPatternUrl: any = noop;
export const isWEMOpenInNewTab: any = noop;
export const logoutAndRedirectToLogin: any = noop;
export const saveExtCredential: any = noop;
export const unescapeEntities: any = noop;
export const wemPortals: any = noop;

export type AppPermissions = any;
export type DigitalJWTModifier = any;
export type IAccountExtCredential = any;
export type IAccountExtCredentialsApiKey = any;
export type IAccountExtCredentialsApiKeyUpdate = any;
export type IAccountExtCredentialsBasic = any;
export type IAccountExtCredentialsBasicUpdate = any;
export type IAccountExtCredentialsCustomAuth = any;
export type IAccountExtCredentialsJWT = any;
export type IAccountExtCredentialsOauth = any;
export type IAccountExtCredentialsOauthUpdate = any;
export type IAccountExtCredentialsSave = any;
export type IFullUserDetails = any;
export type IParamWithType = any;
export type ProblemReportData = any;
export type PropertyPath = any;
export type RequestType = any;

export default {} as any;
