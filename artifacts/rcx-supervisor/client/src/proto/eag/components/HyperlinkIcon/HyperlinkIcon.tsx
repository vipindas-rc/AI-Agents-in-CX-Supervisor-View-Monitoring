import { useCallback, type FC } from 'react';

import { Tooltip } from '@ringcx/ui';

import { HyperlinkIconButton, OpenInNewStyled } from './styled';
import type { IHyperlinkIconProps } from './types';
import type { MatchItem } from '../CRM/types';

export const HyperlinkIcon: FC<IHyperlinkIconProps> = ({
    CrmSvc,
    title,
    dataAid,
    item,
}) => {
    const onHandleOpenRecord = useCallback(
        (item: MatchItem) => {
            CrmSvc.openRecord({
                type: item.type,
                params: item.id,
                url: item.url,
            });
        },
        [CrmSvc]
    );

    const shouldRenderHyperlink = useCallback(
        (item: MatchItem) => {
            const shouldRender =
                (CrmSvc?.canOpenRecord() && item.id && item.type) || item.url;
            return shouldRender;
        },
        [CrmSvc]
    );

    return shouldRenderHyperlink(item) ? (
        <Tooltip title={title}>
            <HyperlinkIconButton
                data-aid={dataAid}
                aria-label={title}
                onClick={(e) => {
                    onHandleOpenRecord(item);
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <OpenInNewStyled />
            </HyperlinkIconButton>
        </Tooltip>
    ) : null;
};
