import {
    type Dispatch,
    type SetStateAction,
    type ReactNode,
    type FC,
    useCallback,
    Fragment,
} from 'react';

import { Tooltip } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import {
    StyledInput,
    StyledManualKeyField,
    Subtitle,
    StyledDialog,
    StyledButton,
} from './BrowserExtensionModal.styled';

export interface IBrowserExtensionModal {
    isOpen: boolean;
    isReconnect: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    saveToLocalStorage: (value?: string, isReconnect?: boolean) => void;
    disableConnect: boolean;
    setInputValue: Dispatch<SetStateAction<string>>;
    inputValue: string;
}
const BrowserExtensionModal: FC<IBrowserExtensionModal> = ({
    isOpen,
    isReconnect,
    setIsOpen,
    saveToLocalStorage,
    disableConnect,
    setInputValue,
    inputValue,
}) => {
    const { t } = useTranslation();

    const handleInputChange = useCallback((value: string) => {
        setInputValue(value);
    }, []);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        setInputValue('');
    }, []);

    const handleConnect = useCallback(() => {
        saveToLocalStorage(inputValue, isReconnect);
    }, [inputValue, isReconnect]);

    function dialogContent(): ReactNode {
        return (
            <Fragment>
                <Subtitle>{t('CRM.CHROME_PLUGIN.PASTE_KEY_MESSAGE')}</Subtitle>
                <Tooltip title={inputValue} placement='bottom'>
                    <StyledManualKeyField>
                        <StyledInput
                            placeholder={t('CRM.CHROME_PLUGIN.PASTE_KEY')}
                            title={t('CRM.CHROME_PLUGIN.KEY')}
                            size='small'
                            value={inputValue}
                            onChange={handleInputChange}
                        />
                    </StyledManualKeyField>
                </Tooltip>
            </Fragment>
        );
    }

    return (
        <StyledDialog
            data-sui-theme-scope
            open={isOpen}
            onClose={handleCancel}
            dialogTitle={t('CRM.CHROME_PLUGIN.CONNECT_TITLE')}
            content={dialogContent()}
            hideCloseWithX={true}
            actions={[
                <StyledButton
                    key='Cancel'
                    variant='outlined'
                    isCancel
                    color='primary'
                    onClick={handleCancel}
                >
                    {t('CRM.CHROME_PLUGIN.CANCEL')}
                </StyledButton>,
                <StyledButton
                    key='Connect'
                    onClick={handleConnect}
                    disabled={disableConnect}
                >
                    {t('CRM.CHROME_PLUGIN.CONNECT')}
                </StyledButton>,
            ]}
            disableBackdropClick
        />
    );
};

export default BrowserExtensionModal;
