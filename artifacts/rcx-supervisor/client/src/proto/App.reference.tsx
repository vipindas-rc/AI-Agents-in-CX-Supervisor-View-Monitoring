import { Component, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { RcThemeProvider } from '@ringcentral/juno';
import { theme } from '@ringcx/ui';
import { SupervisorAgentList } from './eag/containers/SupervisorAgentList/SupervisorAgentList';
import { DigitalInteractionTable } from './eag/components/DigitalInteractionTable/DigitalInteractionTable';
import { InteractionRollupModal } from './eag/containers/SupervisorAgentList/components/InteractionRollupModal';
import { SearchBar } from './eag/components/Search/SearchBar';
import { TableConfigGrid } from './eag/components/TableConfigGrid/TableConfigGrid';
import DndProviderWrapper from './eag/components/TableConfigGrid/DndProviderWrapper';
import Filter from './eag/components/Filter';
import { Button } from '@ringcx/ui';
import {
  columns,
  makeAgents,
  interactionColumns,
  makeInteractions,
  rollupColumns,
} from './mock/supervisorMock';
import { CATEGORIES_MAP } from './eag/helpers/injector';

// unique {id, displayName} list preserving first-seen order
const uniqItems = (pairs: Array<{ id: string; displayName: string }>) => {
  const seen = new Set<string>();
  const out: Array<{ id: string; displayName: string }> = [];
  for (const p of pairs) {
    if (p.id && !seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
};

class ErrorBoundary extends Component<
  { children: ReactNode; label: string },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#A1A1A1', fontSize: 14 }}>
          <strong>{this.props.label}</strong> needs a bit more wiring in the
          prototype: <code>{this.state.error.message}</code>
        </div>
      );
    }
    return this.props.children;
  }
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none',
        border: 'none',
        background: 'transparent',
        padding: '12px 16px',
        fontSize: 14,
        fontWeight: active ? 700 : 500,
        color: active ? '#212121' : '#A1A1A1',
        borderBottom: active ? '2px solid #066FAC' : '2px solid transparent',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState<'agents' | 'interactions'>('agents');
  const [agents, setAgents] = useState(() => makeAgents(25));
  const [monitoredId, setMonitoredId] = useState<string | null>(null);
  const [rollup, setRollup] = useState<{ agentId: string; x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  // --- filter panel (mirrors agentFilterOpen / interactionFilterOpen + selected* in SupervisorSvc) ---
  const [filterOpen, setFilterOpen] = useState(false);
  const [selStates, setSelStates] = useState<string[]>([]); // agents: agentState
  const [selAgentChannels, setSelAgentChannels] = useState<string[]>([]); // agents: channel
  const [selIntAgents, setSelIntAgents] = useState<string[]>([]); // interactions: agentId
  const [selIntChannels, setSelIntChannels] = useState<string[]>([]); // interactions: channel
  const [selIntCategories, setSelIntCategories] = useState<string[]>([]); // interactions: categoryIds
  // when non-null, the table-settings dialog is open with this working copy of columns
  const [settingsDraft, setSettingsDraft] = useState<any[] | null>(null);
  // editable column config (visible toggles) per tab
  const [agentCols, setAgentCols] = useState(() => columns.map((c) => ({ ...c })));
  const [interactionCols, setInteractionCols] = useState(() =>
    interactionColumns.map((c) => ({ ...c }))
  );

  const interactions = useMemo(() => makeInteractions(agents), [agents]);

  // stable identity so SearchBar's internal effect doesn't loop
  const handleSearch = useCallback((val: string) => setSearchValue(val), []);
  // FilterToggle calls onToggle(isActive) with the CURRENT boolean on mount and on
  // every render — SET state to that value (like the real vm.setAgentFilter), never
  // toggle, or the panel opens by default and thrashes on re-render.
  const handleFilterToggle = useCallback(
    (isActive: boolean) => setFilterOpen(isActive),
    []
  );

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout((flash as any)._t);
    (flash as any)._t = window.setTimeout(() => setToast(null), 2600);
  };

  // showMonitor:false ONLY for the actively-monitored agent (-> blue + left bar).
  const displayAgents = useMemo(
    () =>
      agents.map((a: any) => {
        const { subRows, ...rest } = a; // non-expandable (avoids GridList grouped path)
        return {
          ...rest,
          showMonitor: a.agentId !== monitoredId,
          showLogout: true,
          showChangeState: true,
        };
      }),
    [agents, monitoredId]
  );

  // --- filter dropdown items (derived from the live data, like the real controller) ---
  const agentStateItems = useMemo(
    () => uniqItems(agents.map((a: any) => ({ id: a.agentState, displayName: a.agentState }))),
    [agents]
  );
  const agentChannelItems = useMemo(
    () =>
      uniqItems(
        agents.flatMap((a: any) =>
          (a.activeInteractionsSearchCols || []).map((c: any) => ({
            id: c.sourceName,
            displayName: c.sourceName,
          }))
        )
      ),
    [agents]
  );
  const intAgentItems = useMemo(
    () =>
      uniqItems(
        interactions
          .filter((r: any) => r.agentId !== '1000') // exclude self (loggedInAgentId)
          .map((r: any) => ({ id: r.agentId, displayName: r.fullName }))
      ),
    [interactions]
  );
  const intChannelItems = useMemo(
    () => uniqItems(interactions.map((r: any) => ({ id: r.sourceName, displayName: r.sourceName }))),
    [interactions]
  );
  const categoryItems = useMemo(
    () =>
      Object.values(CATEGORIES_MAP).map((c) => ({ id: c.id, displayName: c.name })),
    []
  );

  // applied-filter count = number of active dropdowns (matches SupervisorSvc.appliedFilters*.length)
  const filterCount =
    tab === 'agents'
      ? (selStates.length ? 1 : 0) + (selAgentChannels.length ? 1 : 0)
      : (selIntAgents.length ? 1 : 0) +
        (selIntChannels.length ? 1 : 0) +
        (selIntCategories.length ? 1 : 0);

  // --- table settings (column visibility) ---
  const visibleAgentCols = useMemo(
    () => agentCols.filter((c: any) => c.visible !== false),
    [agentCols]
  );
  const visibleInteractionCols = useMemo(
    () => interactionCols.filter((c: any) => c.visible !== false),
    [interactionCols]
  );
  const currentCols = tab === 'agents' ? agentCols : interactionCols;
  const setCurrentCols = tab === 'agents' ? setAgentCols : setInteractionCols;
  // open the real column-config dialog with a working copy of the current columns
  const openSettings = () => setSettingsDraft(currentCols.map((c: any) => ({ ...c })));
  const saveSettings = () => {
    if (settingsDraft) setCurrentCols(settingsDraft);
    setSettingsDraft(null);
  };

  const rollupAgent = rollup
    ? (agents.find((x: any) => x.agentId === rollup.agentId) as any)
    : null;

  const monitorAgentCallback = (agentId: string) => {
    setMonitoredId(agentId);
    const a = agents.find((x: any) => x.agentId === agentId);
    flash(`Monitoring ${a?.fullName ?? agentId}`);
  };
  const onLogOut = (agentId: string) => {
    const a = agents.find((x: any) => x.agentId === agentId);
    setAgents((prev: any[]) => prev.filter((x) => x.agentId !== agentId));
    if (monitoredId === agentId) setMonitoredId(null);
    flash(`Logged out ${a?.fullName ?? agentId}`);
  };
  const changeAgentState = (agentId: string) => {
    setAgents((prev: any[]) =>
      prev.map((x) =>
        x.agentId === agentId
          ? { ...x, agentState: 'Available', agentBaseState: 'Available' }
          : x
      )
    );
    flash(`State changed to Available`);
  };
  const onInteractionRollupClick = (e: any, agentId: string) => {
    const el = e?.currentTarget || e?.target;
    const r = el?.getBoundingClientRect?.();
    setRollup({
      agentId,
      x: r ? Math.min(r.left, window.innerWidth - 320) : 400,
      y: r ? r.bottom + 4 : 200,
    });
  };

  const inputStyle: React.CSSProperties = {
    height: 32,
    width: 240,
    border: '1px solid #D1D1D1',
    borderRadius: 16,
    padding: '0 14px',
    fontSize: 14,
    outline: 'none',
  };
  const iconBtnStyle: React.CSSProperties = {
    height: 32,
    width: 32,
    border: '1px solid #D1D1D1',
    borderRadius: 8,
    background: settingsDraft ? '#F4F4F4' : '#fff',
    cursor: 'pointer',
    fontSize: 16,
    color: '#666',
  };

  return (
    <RcThemeProvider>
      <ThemeProvider theme={theme as any}>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid #E0E0E0',
              fontWeight: 700,
            }}
          >
            RingCX · Supervisor{' '}
            <span style={{ color: '#A1A1A1', fontWeight: 400 }}>(prototype)</span>
          </div>

          {/* tabs + toolbar (search + settings) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #E0E0E0',
              padding: '0 16px 0 8px',
            }}
          >
            <div style={{ display: 'flex' }}>
              <Tab active={tab === 'agents'} onClick={() => setTab('agents')}>
                Agents
              </Tab>
              <Tab
                active={tab === 'interactions'}
                onClick={() => setTab('interactions')}
              >
                Interactions
              </Tab>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 260 }}>
                <SearchBar
                  searchItem={searchValue}
                  setSearch={handleSearch}
                  placeholder={
                    tab === 'agents' ? 'Search agents' : 'Search interactions'
                  }
                  filterLabel={'Filters'}
                  filterInitState={filterOpen}
                  filterCount={filterCount}
                  onFilterToggle={handleFilterToggle}
                />
              </div>
              <button
                style={iconBtnStyle}
                title="Table settings (columns)"
                onClick={openSettings}
              >
                ⚙
              </button>
            </div>
          </div>

          {/* filter panel — mirrors the real search-filter-header (multi-select dropdowns) */}
          {filterOpen && (
            <div
              style={{
                display: 'flex',
                gap: 12,
                padding: '10px 16px',
                borderBottom: '1px solid #E0E0E0',
                background: '#FAFAFA',
                flexWrap: 'wrap',
              }}
            >
              {tab === 'agents' ? (
                <>
                  <Filter
                    openPlaceholder="Agent state"
                    closedPlaceholder="Agent state"
                    ariaLabel="Filter by agent state"
                    disabled={false}
                    allItems={agentStateItems}
                    selectedFilters={selStates}
                    onChange={(v: any) => setSelStates(v)}
                    nothingAvailableText="Nothing available"
                    noResultsFoundText="No results found"
                  />
                  <Filter
                    openPlaceholder="Channels"
                    closedPlaceholder="Channels"
                    ariaLabel="Filter by channel"
                    disabled={false}
                    allItems={agentChannelItems}
                    selectedFilters={selAgentChannels}
                    onChange={(v: any) => setSelAgentChannels(v)}
                    nothingAvailableText="Nothing available"
                    noResultsFoundText="No results found"
                  />
                </>
              ) : (
                <>
                  <Filter
                    openPlaceholder="Agents"
                    closedPlaceholder="Agents"
                    ariaLabel="Filter by agent"
                    disabled={false}
                    allItems={intAgentItems}
                    selectedFilters={selIntAgents}
                    onChange={(v: any) => setSelIntAgents(v)}
                    nothingAvailableText="Nothing available"
                    noResultsFoundText="No results found"
                  />
                  <Filter
                    openPlaceholder="Channels"
                    closedPlaceholder="Channels"
                    ariaLabel="Filter by channel"
                    disabled={false}
                    allItems={intChannelItems}
                    selectedFilters={selIntChannels}
                    onChange={(v: any) => setSelIntChannels(v)}
                    nothingAvailableText="Nothing available"
                    noResultsFoundText="No results found"
                  />
                  <Filter
                    openPlaceholder="Categories"
                    closedPlaceholder="Categories"
                    ariaLabel="Filter by category"
                    disabled={false}
                    allItems={categoryItems}
                    selectedFilters={selIntCategories}
                    onChange={(v: any) => setSelIntCategories(v)}
                    nothingAvailableText="Nothing available"
                    noResultsFoundText="No results found"
                  />
                </>
              )}
            </div>
          )}

          <div style={{ flex: 1, minHeight: 0 }}>
            {tab === 'agents' ? (
              <SupervisorAgentList
                agentList={displayAgents as any}
                columns={visibleAgentCols as any}
                onInteractionsClick={onInteractionRollupClick}
                onInteractionRollupClick={onInteractionRollupClick}
                callTotalsLoading={false}
                loggedInAgentId={'1000'}
                onLogOut={onLogOut}
                monitorAgentCallback={monitorAgentCallback}
                monitoredAgent={
                  { monitoredAgentId: monitoredId ?? '', uii: '' } as any
                }
                selectedChannels={selAgentChannels}
                selectedStates={selStates}
                searchValue={searchValue}
                changeAgentState={changeAgentState}
              />
            ) : (
              <ErrorBoundary label="Interactions">
                <DigitalInteractionTable
                  columns={visibleInteractionCols as any}
                  digitalTaskList={interactions as any}
                  monitorAgentCallback={(_agentId: string, type?: string) =>
                    flash(
                      type === 'bargeIn'
                        ? 'Barge-in started'
                        : type === 'coach'
                          ? 'Coaching started'
                          : 'Monitoring interaction'
                    )
                  }
                  monitoredAgent={{ monitoredAgentId: '', uii: '' } as any}
                  viewInsight={() => flash('View insights')}
                  loggedInAgentId={'1000'}
                  selectedIds={selIntAgents}
                  selectedChannels={selIntChannels}
                  selectedCategories={selIntCategories}
                  searchValue={searchValue}
                  shouldShowViewInsightsButton={true}
                  AgentSvc={{ digitalAgentEnabled: true } as any}
                  FeatureFlagsSvc={{ featureFlags: {} } as any}
                  aiNotesFeatures={[] as any}
                />
              </ErrorBoundary>
            )}
          </div>
        </div>

        {settingsDraft && (
          <>
            <div
              onClick={() => setSettingsDraft(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9998 }}
            />
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                maxHeight: '80vh',
                overflow: 'auto',
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                zIndex: 9999,
                padding: '20px 24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <strong style={{ fontSize: 16 }}>
                  {tab === 'agents'
                    ? 'Update agent columns'
                    : 'Update interaction columns'}
                </strong>
                <button
                  onClick={() => setSettingsDraft(null)}
                  style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#A1A1A1' }}
                >
                  ×
                </button>
              </div>
              {DndProviderWrapper(
                <TableConfigGrid
                  columnOptions={settingsDraft as any}
                  handleOnDragEnd={(cols: any) => setSettingsDraft(cols)}
                />
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <Button onClick={() => setSettingsDraft(null)}>Cancel</Button>
                <Button onClick={saveSettings}>Save</Button>
              </div>
            </div>
          </>
        )}

        {rollup && rollupAgent && (
          <>
            <div
              onClick={() => setRollup(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 9997 }}
            />
            <div
              style={{
                position: 'fixed',
                top: Math.min(rollup.y, window.innerHeight - 360),
                left: rollup.x,
                width: 300,
                background: '#fff',
                border: '1px solid #E0E0E0',
                borderRadius: 8,
                boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
                zIndex: 9998,
                padding: '14px 16px',
              }}
            >
              <InteractionRollupModal
                rollupData={rollupAgent.rollupBreakdown as any}
                rollupColumns={rollupColumns as any}
                total={rollupAgent.interactions24hRollupTotalCount as any}
                agentName={rollupAgent.fullName}
                onClose={() => setRollup(null)}
              />
            </div>
          </>
        )}

        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#212121',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 14,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              zIndex: 9999,
            }}
          >
            {toast}
          </div>
        )}
      </ThemeProvider>
    </RcThemeProvider>
  );
}
