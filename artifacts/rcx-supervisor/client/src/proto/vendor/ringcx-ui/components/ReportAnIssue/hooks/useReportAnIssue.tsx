import { useState, useMemo } from 'react';

import type { ProblemReportData } from '@ringcx/shared';

import { ReportAnIssueButton } from '../components/ReportAnIssueButton';
import { ReportAnIssueModal } from '../ReportAnIssue';

export const useReportAnIssue = (
    onReport: (report: ProblemReportData) => Promise<void>
) => {
    const [open, setOpen] = useState(false);

    const button = useMemo(() => {
        return <ReportAnIssueButton setOpen={setOpen} />;
    }, [setOpen]);

    const modal = useMemo(() => {
        return (
            <ReportAnIssueModal
                open={open}
                setOpen={setOpen}
                onReport={onReport}
            />
        );
    }, [open, setOpen, onReport]);

    return [button, modal];
};
