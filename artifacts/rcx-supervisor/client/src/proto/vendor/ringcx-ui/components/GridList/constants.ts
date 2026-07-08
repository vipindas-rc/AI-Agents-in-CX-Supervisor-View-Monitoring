const PREFIX = 'gl';

export const GL_CLASSES = {
    HEAD_WRAPPER: PREFIX + '-head-wrapper',
    HEAD: PREFIX + '-head',
    FOOTER: PREFIX + '-footer',
    HEAD_GROUPED: PREFIX + '-grouped-list',
    LIST: PREFIX + '-list',
    ROW_GROUP: PREFIX + '-row-group',
    ROW_GROUP_EMPTY: PREFIX + '-row-group-empty',
    ROW: PREFIX + '-row',
    ROW_OPEN: PREFIX + '-row-open',
    SUB_ROW: PREFIX + '-sub-row',
    EMPTY_ROW: PREFIX + '-empty-row',
};

export const GD_CLASS_PREFIX = 'gd-';

export const GL_KEYS = {
    ROW: '_' + PREFIX + '-row',
    ROW_GROUP: '_' + PREFIX + '-row-group',
    SUB_ROW: '_' + PREFIX + '-sub-row',
    EMPTY_ROW: '_' + PREFIX + '-empty-row',
};

/* FOR TESTS */
export const GRID_LIST = {
    HEADER_CELL_COUNT: 4,
    SCROLL_POSITION: 0,
    ROW_BUFFER: 1,
    CONTENT_HEIGHT: 40,
    ROW_HEIGHT: 10,
    VISIBLE_ROWS: 6 /* height = rowCount * rowHeight = 7*10 = 70, renderRowCount = 4+0+2 = 6 */,
};
