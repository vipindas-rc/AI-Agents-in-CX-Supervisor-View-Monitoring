import { MultiSelect } from '@ringcx/ui';
import styled from 'styled-components';

const FILTER_MAX_WIDTH = 320;
const FILTER_MIN_WIDTH = 200;

export const StyledMultiSelect = styled(MultiSelect)`
    width: ${FILTER_MAX_WIDTH}px;
    max-width: ${FILTER_MAX_WIDTH}px;
    min-width: ${FILTER_MIN_WIDTH}px;
    z-index: 30;
`;
