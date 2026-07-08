import type { FC } from 'react';
import { Fragment } from 'react';

import { DownChevron, UpChevron } from '@ringcx/ui';

import type { IChatMessageSendMonitoring } from './types/ChatMessageSendMonitoring';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import translate from '../../helpers/translate';

export const ChatMessagingSendMonitoring: FC<IChatMessageSendMonitoring> = ({
    monitorMessageOpen,
    toggleMonitorMessage,
    sendChat,
    chat,
    updateAgentMessage,
}) => {
    return (
        <Fragment>
            <div
                className={`monitoring-btn ${
                    monitorMessageOpen ? 'monitoring-btn-open' : ''
                }`}
                onClick={toggleMonitorMessage}
            >
                {monitorMessageOpen ? (
                    <UpChevron className='chevron-icon' />
                ) : (
                    <DownChevron className='chevron-icon' />
                )}
            </div>
            {monitorMessageOpen && (
                <div className='monitoring-msg'>
                    <form
                        name='agentChatMsgForm'
                        id={`agentChatMsgForm${chat.uii}`}
                        autoComplete='off'
                        noValidate
                    >
                        <textarea
                            id={`agentChatMsg${chat.uii}`}
                            className='form-control send-area'
                            value={chat.agentMessage}
                            aria-label='Agent Message'
                            disabled={chat.inactive}
                            placeholder={translate('CHAT.MONITOR_SEND_MSG')}
                            required
                            autoFocus={true}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    sendChat();
                                    updateAgentMessage('');
                                }
                            }}
                            onChange={(event) =>
                                updateAgentMessage(event.target.value)
                            }
                        />
                        <button
                            type='submit'
                            hidden
                            onClick={sendChat}
                            // @ts-ignore
                            translate={translate('CHAT.SEND')}
                        />
                    </form>
                </div>
            )}
        </Fragment>
    );
};
export default CreateAngularModule(
    'chatMessagingSendMonitoring',
    ChatMessagingSendMonitoring,
    [],
    []
);
