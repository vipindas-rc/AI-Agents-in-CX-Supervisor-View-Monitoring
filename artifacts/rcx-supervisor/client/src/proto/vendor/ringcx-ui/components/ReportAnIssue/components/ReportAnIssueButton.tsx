import type { FC, Dispatch, SetStateAction } from 'react';
import { memo } from 'react';

import type { i18n } from 'i18next';
import { useTranslation } from 'react-i18next';

import { TEST_AID } from '../../../constants/index';
import { i18next } from '../../../services/translate';

export const ReportAnIssueButton: FC<{
    setOpen: Dispatch<SetStateAction<boolean>>;
    i18n?: i18n;
}> = memo(({ setOpen, i18n = i18next }) => {
    const { t } = useTranslation(undefined, { i18n });
    return (
        <a
            data-aid={TEST_AID.FEEDBACK_MENU_BUTTON}
            href='#report-an-issue'
            onClick={(e) => {
                e.preventDefault();

                setOpen(true);
            }}
            tabIndex={0}
        >
            {t('FEEDBACK.MENU_BUTTON')}
        </a>
    );
});
