import type { ReactElement } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DndProviderWrapper = (WrappedComponent: ReactElement) => {
    return <DndProvider backend={HTML5Backend}>{WrappedComponent}</DndProvider>;
};

export default DndProviderWrapper;
