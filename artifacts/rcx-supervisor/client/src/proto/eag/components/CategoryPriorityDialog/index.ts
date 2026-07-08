import { CategoryPriorityDialogContainer } from './CategoryPriorityDialog';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'categoryPriorityDialog',
    CategoryPriorityDialogContainer,
    ['open', 'toggle', 'onSave'],
    ['CategoriesSvc', 'DashboardSvc', 'PriorityCategoriesNotificationSvc'],
    true
);
