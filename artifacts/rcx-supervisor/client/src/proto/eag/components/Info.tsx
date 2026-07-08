import type { FC } from 'react';

import { PanelBody } from './CallDetailsPanel/CallDetailsPanel.styled';
import { DataPairs } from './DataPairs';
import type { ICallInfo } from '../containers/CallDetails/CallInfoPanel/types/CallInfoPanel';

/*
 * A generic functional component that takes a data pair list as param and returns
 * jsx of a list of <DataPairs> component.
 * */
export const Info: FC<ICallInfo> = ({ dataPairs }) => {
    const DataPairList = dataPairs.map((dataPair, index) => {
        return <DataPairs key={`${dataPair.label}${index}`} {...dataPair} />;
    });

    return <PanelBody>{DataPairList}</PanelBody>;
};
