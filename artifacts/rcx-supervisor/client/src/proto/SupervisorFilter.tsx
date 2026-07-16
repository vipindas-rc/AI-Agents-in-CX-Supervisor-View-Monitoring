import type { FC } from "react";
import { ThemeProvider } from "styled-components";
import { RcThemeProvider } from "@ringcentral/juno";
import { theme } from "@ringcx/ui";

import { Filter } from "./eag/components/Filter/Filter";

export interface SupervisorFilterOption {
  value: string;
  label: string;
}

export interface SupervisorFilterProps {
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder: string;
  options: SupervisorFilterOption[];
  disabled?: boolean;
  testId?: string;
  ariaLabel?: string;
}

// Thin, page-facing wrapper around the real RingCX `Filter` (which itself wraps
// `@ringcx/ui`'s `MultiSelect`). The styled-components + juno theme providers are
// required for the MultiSelect to render, and they live here so the page never
// has to import from the (tsc-excluded) proto tree directly.
export const SupervisorFilter: FC<SupervisorFilterProps> = ({
  values,
  onValuesChange,
  placeholder,
  options,
  disabled = false,
  testId,
  ariaLabel,
}) => {
  return (
    <RcThemeProvider>
      <ThemeProvider theme={theme as any}>
        <div data-testid={testId}>
          <Filter
            ariaLabel={ariaLabel ?? placeholder}
            disabled={disabled}
            openPlaceholder={placeholder}
            closedPlaceholder={placeholder}
            selectedFilters={values}
            allItems={options.map((o) => ({
              id: o.value,
              displayName: o.label,
            }))}
            onChange={onValuesChange}
            noResultsFoundText="No results found"
          />
        </div>
      </ThemeProvider>
    </RcThemeProvider>
  );
};

export default SupervisorFilter;
