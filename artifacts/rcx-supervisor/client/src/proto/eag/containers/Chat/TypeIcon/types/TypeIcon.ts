import type { IChatType } from '../../ChatList/components/ChatCard/types/ChatCard';

export type TypeIconTooltipVariant = 'ringcx' | 'spring';

export interface ITypeIcon {
    inColor?: string;
    source?: IChatType;
    showTip?: boolean;
    tooltipVariant?: TypeIconTooltipVariant;
    keyboardFocusable?: boolean;
    className?: string;
}
