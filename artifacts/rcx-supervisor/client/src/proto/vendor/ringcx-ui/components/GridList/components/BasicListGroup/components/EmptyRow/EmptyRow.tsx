import type { FC } from 'react';

import type { IEmptyRow } from './types';
import { TEST_AID } from '../../../../../../constants';
import { GL_CLASSES } from '../../../../constants';

const EmptyRow: FC<IEmptyRow> = ({ children }) => {
    if (!children) {
        return null;
    }

    return (
        <div
            className={GL_CLASSES.EMPTY_ROW}
            data-aid={TEST_AID.GRID_LIST.EMPTY_ROW}
            role='row'
        >
            {children}
        </div>
    );
};

export default EmptyRow;
