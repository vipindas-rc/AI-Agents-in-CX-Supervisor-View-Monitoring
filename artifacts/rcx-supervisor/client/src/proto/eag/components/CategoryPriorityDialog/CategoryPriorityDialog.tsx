import { useMemo, useState } from 'react';

import { Xsm, InfoMd, CirclePlusMd } from '@ringcentral/spring-icon';
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Dialog,
    IconButton,
    Checkbox,
    FormLabel,
    Tooltip,
    Icon,
} from '@ringcentral/spring-ui';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { CategoryPriorityItem } from './CategoryPriorityItem';
import {
    formatCategoriesToOptions,
    getInitialCategoriesPrioritySettings,
} from './helpers';
import { useScrollableObserver } from './useScrollableObserver';
import DndProviderWrapper from '../TableConfigGrid/DndProviderWrapper';

type CategoryPriorityDialogProps = {
    open: boolean;
    toggle: () => void;
    onSave?: () => void;
    CategoriesSvc: any;
    DashboardSvc: any;
    PriorityCategoriesNotificationSvc: any;
};

const CategoryPriorityDialog = ({
    toggle,
    onSave,
    CategoriesSvc,
    DashboardSvc,
    PriorityCategoriesNotificationSvc,
}: CategoryPriorityDialogProps) => {
    const { t } = useTranslation();

    const { options, categoryIdToOptionMap } = useMemo(
        () => formatCategoriesToOptions(CategoriesSvc.categories),
        [CategoriesSvc.categories]
    );

    const { categoryPriorities, isNotificationEnabled } = useMemo(
        () =>
            getInitialCategoriesPrioritySettings(
                DashboardSvc.getPriorityCategoriesSettings(),
                categoryIdToOptionMap
            ),
        [DashboardSvc, categoryIdToOptionMap]
    );

    const [categories, setCategories] = useState(categoryPriorities);

    const [notificationsEnabled, setNotificationsEnabled] = useState(
        isNotificationEnabled
    );

    const { dialogContentRef, bottomDetectorRef, scrollable } =
        useScrollableObserver();

    const handleCancel = () => toggle();

    const handleSave = () => {
        const newPriorityCategoriesSettings = {
            priorityCategories: categories
                .filter((category) => category.id)
                .reduce(
                    (acc, category, index) => ({
                        ...acc,
                        [category.id]: index + 1,
                    }),
                    {} as Record<string, number>
                ),
            isNotificationEnabled: notificationsEnabled,
        };
        DashboardSvc.setPriorityCategoriesSettings(
            newPriorityCategoriesSettings
        );
        PriorityCategoriesNotificationSvc.updateSortedCategoryIds(
            newPriorityCategoriesSettings
        );
        if (onSave) {
            onSave();
        }
        toggle();
    };

    const handleNotificationChange = (checked: boolean) =>
        setNotificationsEnabled(checked);

    const findItem = (key: string) => {
        const originalIndex = categories.findIndex((item) => item.key === key);
        return {
            item: categories[originalIndex],
            originalIndex,
        };
    };

    const moveItem = (key: string, atIndex: number) => {
        const { item, originalIndex } = findItem(key);
        if (item && originalIndex !== atIndex) {
            categories.splice(originalIndex, 1);
            categories.splice(atIndex, 0, item);
            setCategories([...categories]);
        }
    };

    const updateItem = (key: string, id: string, label: string) => {
        const { item } = findItem(key);
        if (item) {
            item.id = id;
            item.label = label;
            setCategories([...categories]);
        }
    };

    const addItem = () => {
        const newItem = {
            key: crypto.randomUUID(),
            id: '',
            label: '',
        };
        setCategories([...categories, newItem]);
    };

    const deleteItem = (key: string) => {
        const newCategories = categories.filter((item) => item.key !== key);
        setCategories(newCategories);
    };

    return (
        <Dialog
            open
            size='large'
            className='z-[9999]'
            disableBackdropClick
            onClose={handleCancel}
            classes={{ body: 'min-w-150' }}
        >
            <DialogTitle className='block'>
                <div className='flex items-center justify-between'>
                    <span>{t('GENERICS.MODAL.CATEGORY_PRIORITY.TITLE')}</span>
                    <IconButton
                        iconSize='large'
                        variant='icon'
                        symbol={Xsm}
                        onClick={handleCancel}
                        className='ml-auto h-6 py-0 !text-inherit'
                        aria-label={t('GENERICS.ACTIONS.CLOSE')}
                    />
                </div>
                <div className='mt-3'>
                    <div className='typography-mainText text-neutral-b1 leading-5'>
                        {t('GENERICS.MODAL.CATEGORY_PRIORITY.DESCRIPTION')}
                    </div>
                </div>
            </DialogTitle>
            <DialogContent
                ref={dialogContentRef}
                className={clsx(
                    'pt-1.5',
                    scrollable &&
                        'border-y-1 border-y-neutral-b4 border-0 border-solid'
                )}
            >
                <div
                    className='flex flex-col space-y-0.5'
                    key={categories.length}
                >
                    {categories.map((category, index) => {
                        const filteredCategories = categories.filter(
                            (item) => item.id !== category.id
                        );
                        const categoryOption = options.filter((option) => {
                            return filteredCategories.every(
                                (priorityItem) => priorityItem.id !== option.id
                            );
                        });
                        return (
                            <CategoryPriorityItem
                                key={category.key}
                                category={category}
                                options={categoryOption}
                                order={index + 1}
                                moveItem={moveItem}
                                findItem={findItem}
                                updateItem={updateItem}
                                deleteItem={deleteItem}
                            />
                        );
                    })}
                </div>

                <Button
                    variant='text'
                    color='primary'
                    startIcon={CirclePlusMd}
                    classes={{ root: 'p-0 !mt-2' }}
                    onClick={addItem}
                >
                    {t('GENERICS.MODAL.CATEGORY_PRIORITY.NEW_CATEGORY')}
                </Button>

                <div className='mt-3 flex items-center'>
                    <FormLabel
                        label={t(
                            'GENERICS.MODAL.CATEGORY_PRIORITY.ENABLE_NOTIFICATIONS'
                        )}
                        placement='end'
                        classes={{ label: 'typography-mainText' }}
                    >
                        <Checkbox
                            checked={notificationsEnabled}
                            onChange={(e) =>
                                handleNotificationChange(e.target.checked)
                            }
                        />
                    </FormLabel>
                    <Tooltip
                        placement='top'
                        title={t(
                            'GENERICS.MODAL.CATEGORY_PRIORITY.NOTIFICATION_DESCRIPTION'
                        )}
                        classes={{ root: 'z-[9999]' }}
                    >
                        <Icon
                            symbol={InfoMd}
                            size='xsmall'
                            tabIndex={0}
                            aria-label={t(
                                'GENERICS.MODAL.CATEGORY_PRIORITY.NOTIFICATION_DESCRIPTION'
                            )}
                            role='tooltip'
                        />
                    </Tooltip>
                </div>
                <div
                    ref={bottomDetectorRef}
                    className={clsx(scrollable && 'pt-5')}
                />
            </DialogContent>
            <DialogActions>
                <Button color='primary' variant='text' onClick={handleCancel}>
                    {t('GENERICS.ACTIONS.CANCEL')}
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSave}
                >
                    {t('GENERICS.ACTIONS.SAVE')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const CategoryPriorityDialogContainer = (
    props: CategoryPriorityDialogProps
) => {
    if (!props.open) {
        return null;
    }
    return DndProviderWrapper(<CategoryPriorityDialog {...props} />);
};
