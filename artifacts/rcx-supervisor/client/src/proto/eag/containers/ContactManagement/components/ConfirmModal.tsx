import {
    Dialog,
    Button,
    DialogActions,
    DialogTitle,
    DialogContent,
} from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

type ConfirmModalProps = {
    open: boolean;
    cancelButtonText?: string;
    saveButtonText?: string;
    onClickCancelButton: () => void;
    onClickSaveButton: () => void;
    title: string;
    confirmText: string;
    errorMessage?: string;
    isLoading?: boolean;
};

export const ConfirmModal = ({
    cancelButtonText,
    saveButtonText,
    title,
    confirmText,
    onClickCancelButton,
    onClickSaveButton,
    errorMessage,
    isLoading,
    ...restProps
}: ConfirmModalProps) => {
    const { t } = useTranslation();
    return (
        <Dialog
            {...restProps}
            size='small'
            className='z-tooltip flex justify-center'
        >
            <DialogTitle className='typography-title mb-3 font-bold'>
                {title}
            </DialogTitle>
            <DialogContent>
                {errorMessage && (
                    <div className='text-danger mb-3'>{errorMessage}</div>
                )}
                <div className='typography-mainText'>{confirmText}</div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClickCancelButton}
                    variant='outlined'
                    disabled={isLoading}
                >
                    {cancelButtonText ||
                        t('CONTACT_MANAGEMENT.CONTACT_PROFILE.CANCEL')}
                </Button>
                <Button onClick={onClickSaveButton} loading={isLoading}>
                    {saveButtonText ||
                        t('CONTACT_MANAGEMENT.CONTACT_PROFILE.SAVE')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
