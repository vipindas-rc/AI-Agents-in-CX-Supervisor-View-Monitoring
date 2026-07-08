import { Avatar } from '@material-ui/core';

import { CRMSearchResultListItemIcon } from '../../../../components/CRM/CRMMatchResult/CRMSearchResult/CRMSearchResult.styled';
import { CRMSearchResultListItemTypedIcon } from '../../../../components/CRM/CRMMatchResult/styled';
import type { MatchItem } from '../../../../components/CRM/types';
import type { CRMPlatform } from '../../../../constants/crm';
import { ICON_MAP } from '../constants';

export function useIconCreator(platform: CRMPlatform) {
    return (item: MatchItem) => {
        const IconMap = ICON_MAP[platform as keyof typeof ICON_MAP];
        const Icon =
            (item.type &&
                IconMap &&
                (IconMap[item.type] || IconMap['Custom'])) ||
            Avatar;
        if (typeof Icon === 'string') {
            return (
                <CRMSearchResultListItemTypedIcon>
                    <CRMSearchResultListItemIcon
                        src={Icon as string}
                        alt={item.type}
                    />
                </CRMSearchResultListItemTypedIcon>
            );
        } else {
            return <Icon className='tag-icon icon-with-theme' />;
        }
    };
}
