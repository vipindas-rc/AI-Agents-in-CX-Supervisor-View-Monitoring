import type { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { EmptyStateImage } from '../../components/Splash/components/EmptyStateImage';
import { Splash } from '../../components/Splash/Splash';
import { SPLASH_TYPES } from '../../constants/emptyStates';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { withBrandTheme } from '../../helpers/withBrandTheme';

export const InteractionSummaryEmptyContent: FC = () => {
    const { t } = useTranslation();

    return (
        <Splash
            text={t('INTERACTION.SUMMARY_PAGE.TITLE')}
            subText={t('INTERACTION.SUMMARY_PAGE.SUBTEXT')}
            icon={<EmptyStateImage type='NoInteractionHistory' />}
            splashType={SPLASH_TYPES.SIDE_PANEL}
        />
    );
};

export const InteractionSummaryEmpty = withBrandTheme(
    InteractionSummaryEmptyContent
);

export default CreateAngularModule(
    'interactionSummary',
    InteractionSummaryEmpty
);
