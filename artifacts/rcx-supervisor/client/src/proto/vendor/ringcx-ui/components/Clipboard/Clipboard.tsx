import type { FC } from 'react';
import { useEffect, useState } from 'react';

import type { IClipboard } from './types';
import { isCopyAllowed, copyToClipboard } from '../../helpers';

const IsCopyAllowed = isCopyAllowed();

const Clipboard: FC<IClipboard> = ({ children }) => {
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        IsCopyAllowed.then(setIsAllowed);
    }, []);

    return isAllowed ? children(copyToClipboard) : null;
};

export default Clipboard;
