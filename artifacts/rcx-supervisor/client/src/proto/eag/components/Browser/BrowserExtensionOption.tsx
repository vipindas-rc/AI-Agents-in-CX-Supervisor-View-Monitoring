import { useState, type FC, useEffect, useCallback } from 'react';

import { Text, Link } from '@ringcentral/spring-ui';
import { Session } from '@ringcx/shared';
import { Tooltip } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import BrowserExtensionModal from './BrowserExtensionModal';
import { StyledButton } from './BrowserExtensionModal.styled';
import { CHROME_PLUGIN_CONSTANTS } from '../../constants/crm';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export interface IBrowserExtensionOption {
    CrmSvc: any;
    ChromeSvc: any;
    NotificationSvc: any;
}
export const BrowserExtensionOption: FC<IBrowserExtensionOption> = ({
    CrmSvc,
    ChromeSvc,
    NotificationSvc,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isReconnect, setIsReconnect] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(ChromeSvc.isWsConnected);
    const { t } = useTranslation();

    const closeModal = () => {
        setIsOpen(false);
    };
    useEffect(() => {
        setIsConnected(ChromeSvc.isWsConnected);
    }, [ChromeSvc.isWsConnected]);
    async function isValidRSAPublicKey(pem: string): Promise<boolean> {
        try {
            const normalized = pem
                .replace(/-----BEGIN PUBLIC KEY-----/, '')
                .replace(/-----END PUBLIC KEY-----/, '')
                .replace(/[\r\n]+/g, '')
                .replace(/\s+/g, '');

            const binaryDer = Uint8Array.from(atob(normalized), (c) =>
                c.charCodeAt(0)
            );

            await crypto.subtle.importKey(
                'spki',
                binaryDer.buffer,
                {
                    name: 'RSA-OAEP',
                    hash: 'SHA-256',
                },
                true,
                ['encrypt']
            );

            return true;
        } catch (err) {
            return false;
        }
    }
    const saveFromClipboard = async () => {
        try {
            const spog_key = localStorage.getItem(
                CHROME_PLUGIN_CONSTANTS.SPOG_PUBLIC_KEY
            );
            if (spog_key) {
                await saveToLocalStorage(spog_key);
                return;
            }
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                await saveToLocalStorage(text);
            } else {
                NotificationSvc?.showError(
                    t('CRM.CHROME_PLUGIN.CLIPBOARD_MESSAGE')
                );
            }
        } catch (e: unknown) {
            NotificationSvc?.showError(
                t('CRM.CHROME_PLUGIN.CLIPBOARD_MESSAGE')
            );
        }
    };

    const saveToLocalStorage = useCallback(
        async (value?: string, isReconnect?: boolean) => {
            setIsConnecting(true);
            const isValid = await isValidRSAPublicKey(value || '');
            if (value && isValid) {
                const agentDetails = Session.getUserDetails().agentDetails;
                const currentAgent = agentDetails?.[0];
                const agentId = currentAgent?.agentId;
                localStorage.setItem(
                    CHROME_PLUGIN_CONSTANTS.SPOG_PUBLIC_KEY,
                    value
                );
                if (agentId) {
                    localStorage.setItem(
                        CHROME_PLUGIN_CONSTANTS.SPOG_PUBLIC_KEY_AGENT_ID,
                        agentId.toString()
                    );
                }
            } else {
                NotificationSvc?.showError(
                    t('CRM.CHROME_PLUGIN.ERROR.KEY_FAILED')
                );
                setIsConnecting(false);
                return;
            }

            try {
                let connect = false;
                if (isReconnect) {
                    connect = await CrmSvc.reconnectWsConnection(value);
                } else {
                    connect = await CrmSvc._connectToSpog(value);
                }

                if (connect) {
                    closeModal();
                    setIsConnected(true);
                    setInputValue('');
                    setIsConnecting(false);
                }
            } catch (error) {
                NotificationSvc?.showError(
                    t('CRM.CHROME_PLUGIN.ERROR.CONNECTION_ERROR')
                );
                setIsConnected(false);
                setIsConnecting(false);
            }
        },
        []
    );
    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);
    const handleReconnect = useCallback(() => {
        setIsOpen(true);
        setIsReconnect(true);
    }, []);
    const connectButton = (
        <StyledButton
            onClick={saveFromClipboard}
            className='typography-subtitleMini h-[32px] w-[125px]'
            size='medium'
            variant='contained'
            color='primary'
            disabled={isConnected}
        >
            {isConnected
                ? t('CRM.CHROME_PLUGIN.CONNECTED')
                : t('CRM.CHROME_PLUGIN.CONNECT')}
        </StyledButton>
    );
    return (
        <div data-sui-theme-scope>
            <div className='m-auto mt-[20px] w-[400px]'>
                <Text className='text-neutral-b2 typography-subtitle mb-[10px] block font-normal'>
                    {t('CRM.CHROME_PLUGIN.BROWSER_EXTENSION')}
                </Text>
                <div className='border-neutral-b0-t10 bg-neutral-base shadow-sui-xs flex w-full flex-row gap-[40px] rounded border border-solid p-4'>
                    <div className='flex flex-col'>
                        <Text className='typography-subtitleBold text-neutral-b0'>
                            {t('CRM.CHROME_PLUGIN.CONNECT_TITLE')}
                        </Text>
                        <Text className='typography-descriptor text-neutral-b2 pt-[10px] text-xs'>
                            {isConnected
                                ? t('CRM.CHROME_PLUGIN.CONNECT_SUBTITLE')
                                : t('CRM.CHROME_PLUGIN.CONNECT_SUBTITLE_2')}
                            <Link
                                component='button'
                                type='button'
                                variant='primary'
                                onClick={
                                    isConnected ? handleReconnect : handleOpen
                                }
                                className='typography-descriptor inline !border-0 !bg-transparent !p-0 text-xs font-normal underline decoration-solid !shadow-none hover:!bg-transparent hover:!shadow-none focus-visible:!bg-transparent active:!bg-transparent'
                            >
                                {isConnected
                                    ? t('CRM.CHROME_PLUGIN.UPDATE_KEY')
                                    : t('CRM.CHROME_PLUGIN.MANUAL_KEY')}
                            </Link>
                        </Text>
                    </div>
                    <div>
                        {isConnected ? (
                            <Tooltip
                                title={t('CHROME_PLUGIN.DISCONNECT_MESSAGE')}
                                placement='bottom'
                            >
                                {connectButton}
                            </Tooltip>
                        ) : (
                            connectButton
                        )}
                    </div>
                </div>
            </div>
            <BrowserExtensionModal
                isReconnect={isReconnect}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                setInputValue={setInputValue}
                inputValue={inputValue}
                saveToLocalStorage={saveToLocalStorage}
                disableConnect={isConnecting}
            />
        </div>
    );
};

export default CreateAngularModule(
    'browserExtensionOption',
    BrowserExtensionOption,
    [],
    ['CrmSvc', 'ChromeSvc', 'NotificationSvc']
);
