import { StyledEuiSingleSelect } from './EuiSingleSelect.styled';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'engageUiSingleSelect',
    StyledEuiSingleSelect,
    [
        'data',
        'onChange',
        'isSearchable',
        'size',
        'width',
        'selectedItemId',
        'placeholder',
        'visibleItemsCount',
    ]
);
