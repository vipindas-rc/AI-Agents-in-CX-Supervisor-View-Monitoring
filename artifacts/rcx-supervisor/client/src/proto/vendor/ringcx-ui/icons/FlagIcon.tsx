import type { FC } from 'react';

const FlagIcon: FC<{
    iso: string;
}> = ({ iso, ...props }) => (
    <i className={`eui-flag-icon ${iso.toLowerCase()}`} {...props} />
);

export default FlagIcon;
