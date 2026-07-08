import type { FC } from 'react';

import { Tooltip } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

interface IEuiTooltipProps {
    name: string;
    classNames?: string;
    handleClick?: () => void;
}

export const EuiTooltip: FC<IEuiTooltipProps> = ({
    name,
    classNames,
    handleClick,
}) => {
    const onClick = () => {
        handleClick?.();
    };

    return (
        <Tooltip title={name}>
            <div className={classNames} onClick={onClick}>
                {name}
            </div>
        </Tooltip>
    );
};

export default CreateAngularModule(
    'euiTooltip',
    EuiTooltip,
    ['name', 'classNames', 'handleClick'],
    []
);
