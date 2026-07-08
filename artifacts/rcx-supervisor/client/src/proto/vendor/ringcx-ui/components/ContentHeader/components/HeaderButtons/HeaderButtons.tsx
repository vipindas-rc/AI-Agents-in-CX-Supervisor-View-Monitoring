import type { FC } from 'react';

import { HeaderButtonContainer } from './HeaderButtons.styles';
import type { IHeaderButtons } from './types';
import { Button } from '../../../Button';

const HeaderButtons: FC<IHeaderButtons> = ({ items, disabled }) => {
    return (
        <HeaderButtonContainer>
            {items.map(({ title, key, ...props }, index) => (
                <Button key={key || index} {...{ ...props, disabled }}>
                    {title}
                </Button>
            ))}
        </HeaderButtonContainer>
    );
};

export default HeaderButtons;
