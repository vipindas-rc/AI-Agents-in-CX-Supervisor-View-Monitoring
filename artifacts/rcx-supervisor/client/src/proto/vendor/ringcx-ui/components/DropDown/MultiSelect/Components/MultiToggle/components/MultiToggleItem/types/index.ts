import type { IFlatMenuItem } from '../../../../../../types';
import type { IMultiToggle } from '../../../types';

export interface IMultiToggleItem
    extends Pick<IMultiToggle, 'size' | 'disabled'> {
    item: IFlatMenuItem;
    selected?: boolean;
    dataAid?: string;
    onClick: () => void;
    onClose: () => void;
}
