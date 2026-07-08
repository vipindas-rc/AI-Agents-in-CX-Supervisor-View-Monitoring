import { CategoriesAutoComplete } from './CategoriesAutoComplete';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'categoriesAutoComplete',
    CategoriesAutoComplete,
    ['onOpen', 'value', 'options', 'required', 'emptyFields']
);
