import type { ReactNode } from 'react';

import type { IChatType } from '../../Chat/ChatList/components/ChatCard/types/ChatCard';

export interface IRollupInteraction {
    glId: string;
    count: string | number;
    sourceId: string;
    sourceType: IChatType;
    sourceName: string;
    sourceColor: string;
}

export interface IRollupInteractionCol {
    id: string;
    sortAs: number;
    translationPath: string;
    content: string | ReactNode;
    disabled?: boolean;
}

export interface IRollupInteractions {
    rollupData: RenderRowsOneRowData<IRollupInteraction>;
    rollupColumns: IRollupInteractionCol[];
    onClose: () => void;
    total: string;
    agentName: string;
}

export interface IEdSource {
    id: string;
    name: string;
    color: number;
    type: IChatType;
}

type RenderRowOneRowData<R> = IRollupInteraction & R;
type RenderRowsOneRowData<R> = RenderRowOneRowData<R>[];
