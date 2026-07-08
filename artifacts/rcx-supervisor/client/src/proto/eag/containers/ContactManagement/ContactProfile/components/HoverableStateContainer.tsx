import { PlusMd, EditMd } from '@ringcentral/spring-icon';
import { Tooltip, IconButton, type IconProps } from '@ringcentral/spring-ui';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import {
    CONTACT_MANAGEMENT_HOVERABLE_STATE_CONTAINER,
    HOVERABLE_STATE_CONTAINER_EDIT_BUTTON,
    HOVERABLE_STATE_CONTAINER_ADD_BUTTON,
} from '../../../../constants/testIds';

type HoverableStateContainerProps = {
    editIconSymbol?: IconProps['symbol'];
    editIconTitle?: string;
    renderContent: () => React.ReactNode;
    onClickEditButton: () => void;
    showAddButton?: boolean;
    onClickAddButton?: () => void;
};

export const HoverableStateContainer = ({
    editIconSymbol = EditMd,
    editIconTitle,
    renderContent,
    onClickEditButton,
    showAddButton = false,
    onClickAddButton,
}: HoverableStateContainerProps) => {
    const { t } = useTranslation();

    const editButtonLabel =
        editIconTitle || t('CONTACT_MANAGEMENT.CONTACT_PROFILE.EDIT');
    const addButtonLabel = t('CONTACT_MANAGEMENT.CONTACT_PROFILE.ADD');

    return (
        <div className='w-9/12'>
            <div
                className='group flex items-center gap-2.5'
                data-aid={CONTACT_MANAGEMENT_HOVERABLE_STATE_CONTAINER}
            >
                <div className='group-hover:bg-neutral-b5 group-focus-within:bg-neutral-b5 flex min-h-9 w-full max-w-full items-center justify-between rounded-sm px-4'>
                    <div
                        className={clsx(
                            'typography-mainText max-w-60 truncate',
                            showAddButton && '!max-w-50'
                        )}
                    >
                        {renderContent()}
                    </div>
                    <Tooltip
                        title={editButtonLabel}
                        placement='bottom'
                        color='neutral'
                    >
                        <IconButton
                            symbol={editIconSymbol}
                            className='opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'
                            onClick={onClickEditButton}
                            title={editButtonLabel}
                            data-aid={HOVERABLE_STATE_CONTAINER_EDIT_BUTTON}
                            variant='icon'
                            size='small'
                            iconSize='medium'
                            color='neutral'
                        />
                    </Tooltip>
                </div>
                {showAddButton && (
                    <Tooltip
                        title={addButtonLabel}
                        placement='bottom'
                        color='neutral'
                    >
                        <IconButton
                            symbol={PlusMd}
                            className='opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'
                            onClick={onClickAddButton}
                            title={addButtonLabel}
                            data-aid={HOVERABLE_STATE_CONTAINER_ADD_BUTTON}
                            variant='icon'
                            size='small'
                            iconSize='medium'
                            color='neutral'
                        />
                    </Tooltip>
                )}
            </div>
        </div>
    );
};
