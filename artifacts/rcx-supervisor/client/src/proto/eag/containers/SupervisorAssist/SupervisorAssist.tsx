import { Xsm } from '@ringcentral/spring-icon';
import { IconButton } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import {
    SupervisorAssistWrapper,
    SupervisorAssistHeader,
} from './SupervisorAssist.styled';
import { SUPERVISOR_ASSIST } from '../../constants/testIds';
import CreateAngularModule from '../../helpers/CreateAngularModule';

type PropsType = {
    className?: string;
    onToggle?: () => void;
};

export const SupervisorAssist = ({ className, onToggle }: PropsType) => {
    const { t } = useTranslation();
    return (
        <SupervisorAssistWrapper className={className} data-sui-theme-scope>
            <SupervisorAssistHeader>
                {t('DASHBOARD.INSIGHTS')}
                <IconButton
                    symbol={Xsm}
                    color='secondary'
                    variant='icon'
                    size='xlarge'
                    onClick={onToggle}
                />
            </SupervisorAssistHeader>
            <div
                id='supervisorAssistBindingNode'
                data-aid={SUPERVISOR_ASSIST}
            />
        </SupervisorAssistWrapper>
    );
};

export default CreateAngularModule('supervisorAssist', SupervisorAssist, [
    'className',
    'onToggle',
]);
