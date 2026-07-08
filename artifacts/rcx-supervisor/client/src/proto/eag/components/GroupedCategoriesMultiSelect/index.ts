import { GroupedCategoriesMultiSelect } from './GroupedCategoriesMultiSelect';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'groupedCategoriesMultiSelect',
    GroupedCategoriesMultiSelect,
    [
        'categoryList',
        'selectedCategories',
        'onCategoriesChange',
        'openLabel',
        'closeLabel',
        'ariaLabel',
    ],
    []
);
