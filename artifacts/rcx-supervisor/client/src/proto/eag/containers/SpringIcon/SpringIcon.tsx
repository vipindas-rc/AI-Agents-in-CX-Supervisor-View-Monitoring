import type { ComponentProps } from 'react';

import * as SpringIcon from '@ringcentral/spring-icon';
import { IconButton } from '@ringcentral/spring-ui';

type Props = Omit<ComponentProps<typeof IconButton>, 'symbol'> & {
    symbol: keyof typeof SpringIcon;
};

export const SpringUiIcon = ({
    symbol,
    variant = 'icon',
    label = '',
    classes = {},
    onClick = () => {},
    ...restProps
}: Props) => {
    // eslint-disable-next-line import/namespace
    const icon = SpringIcon[symbol];

    if (!icon) {
        return null;
    }

    return (
        <IconButton
            symbol={icon}
            variant='icon'
            TooltipProps={{ title: label }}
            label={label}
            classes={classes}
            onClick={onClick}
            {...restProps}
        />
    );
};
