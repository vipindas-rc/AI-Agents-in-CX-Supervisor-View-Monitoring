import { CategoriesSelect } from './CategoriesSelect';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule('categoriesSelect', CategoriesSelect, [
    'onChange',
    'value',
    'options',
    'emptyFields',
]);
