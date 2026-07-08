import type { FC } from 'react';
import { Fragment, useCallback } from 'react';

import { Edit, LinkButton } from '@ringcx/ui';

import translate from '../../../../helpers/translate';
import type { IEditLeadButton } from '../types/LeadInfoPanel';

export const EditLeadButton: FC<IEditLeadButton> = ({
    editLead,
    editLeadDisabled,
}) => {
    const editLabel = `${translate('GENERICS.ACTIONS.EDIT')}`;
    const openEditLeadModal = useCallback(() => {
        editLead();
    }, [editLead]);

    return editLeadDisabled ? (
        <Fragment></Fragment>
    ) : (
        <LinkButton
            onClick={openEditLeadModal}
            icon={<Edit />}
            title={editLabel}
        />
    );
};
