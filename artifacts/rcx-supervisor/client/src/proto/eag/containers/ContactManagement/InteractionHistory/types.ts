import type { IconProps } from '@ringcentral/spring-ui/src/Icon/Icon.type';

import type { ChannelType } from '../../../common/services/transport';

export type ChannelConfig = {
    [key in ChannelType]?: Pick<IconProps, 'symbol'> & {
        name: string;
    };
};
