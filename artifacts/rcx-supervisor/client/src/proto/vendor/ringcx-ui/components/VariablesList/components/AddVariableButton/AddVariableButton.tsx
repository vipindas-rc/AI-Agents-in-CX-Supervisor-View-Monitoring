import { memo } from 'react';

import { useTranslation } from 'react-i18next';

import { ButtonWrapper } from './AddVariableButton.styled';
import type { AddVariableButtonProps } from './types';
import { AddNew } from '../../../../icons';
import { i18next } from '../../../../services/translate';
import LinkButton from '../../../LinkButton';

const AddVariableButton = ({
    onClick,
    dataAid,
    i18n = i18next,
}: AddVariableButtonProps) => {
    const { t } = useTranslation(undefined, { i18n });

    return (
        <ButtonWrapper>
            <LinkButton
                data-aid={dataAid}
                title={t('VARIABLES_LIST.ADD')}
                icon={<AddNew />}
                onClick={onClick}
            />
        </ButtonWrapper>
    );
};

export default memo(AddVariableButton);
