import type { Dispatch, FC, SetStateAction } from 'react';

import type { ProblemReportData } from '@ringcx/shared';
import { ProductType } from '@ringcx/shared';
import { ReportAnIssueModal } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { AgentCprClient } from '../../../../common/services/problemReport';
import CreateAngularModule from '../../../../helpers/CreateAngularModule';

export const CrmReportAnIssue: FC<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    CRMPlatform: string;
}> = ({ open, setOpen, CRMPlatform }) => {
    const { t } = useTranslation();
    const issueTitle = t('FEEDBACK.MODAL.DEFAULT_INPUT_TITLE_FOR_CRM', {
        CRMPlatform,
    });

    const handleSubmit = async (reportData: ProblemReportData) => {
        await AgentCprClient.getInstance().handleProblemReportSubmit(
            ProductType.CRM,
            reportData
        );
    };

    return (
        <ReportAnIssueModal
            open={open}
            setOpen={setOpen}
            issueTitle={issueTitle}
            classNames='crm-report-an-issue'
            onReport={handleSubmit}
        ></ReportAnIssueModal>
    );
};

export default CreateAngularModule(
    'crmReportAnIssue',
    CrmReportAnIssue,
    ['open', 'setOpen', 'CRMPlatform'],
    ['NotificationSvc']
);
