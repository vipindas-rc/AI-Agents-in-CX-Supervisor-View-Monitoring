import { useMemo } from 'react';
import type { ReactNode } from 'react';

import { Link } from '@ringcentral/spring-ui';

import type {
    ExternalData,
    ExternalDataAttributesItem,
} from '../../../common/services/transport';
import {
    CONTACT_MANAGEMENT_EXTERNAL_CONTACT,
    CONTACT_MANAGEMENT_EXTERNAL_CONTACT_FIELD,
} from '../../../constants/testIds';
import { getExternalContactDataAttributes } from '../../../helpers/contactManagement';
import { ContactAccordion } from '../components/ContactAccordion';

type ExternalContactProps = {
    isLoading: boolean;
    externalData: ExternalData;
};

export const ExternalContact = ({
    isLoading,
    externalData,
}: ExternalContactProps) => {
    const { header, subheader, attributes } = externalData;

    const externalContactDataAttributes = useMemo(
        () => getExternalContactDataAttributes({ attributes }),
        [attributes]
    );

    if (isLoading) return null;

    const renderField = ({
        label,
        field,
        order,
    }: {
        label: string;
        field: ReactNode;
        order: number;
    }) => (
        <div
            className='flex min-h-9 items-center'
            data-aid={`${CONTACT_MANAGEMENT_EXTERNAL_CONTACT_FIELD}${order}`}
            key={order}
        >
            <div
                className='text-neutral-b2 typography-descriptor w-20 min-w-20 break-all'
                data-aid='label'
            >
                {label}
            </div>
            <div
                className='typography-mainText break-all pl-3 pr-4'
                data-aid='field'
            >
                {field}
            </div>
        </div>
    );

    const getFieldConfig = ({
        kind,
        label,
        value,
        order,
    }: ExternalDataAttributesItem) => {
        let fieldContent: ReactNode = '-';

        if (value) {
            fieldContent =
                kind === 'url' ? (
                    <Link href={value} target='_blank'>
                        {value}
                    </Link>
                ) : (
                    value
                );
        }

        return {
            label,
            field: fieldContent,
            order,
        };
    };

    return (
        <ContactAccordion
            title={header}
            subTitle={subheader}
            defaultExpanded={false}
            expandedBottomBorder
        >
            <div
                className='gap-1.25 grid p-4'
                data-aid={CONTACT_MANAGEMENT_EXTERNAL_CONTACT}
            >
                {externalContactDataAttributes.map((attribute) =>
                    renderField(getFieldConfig(attribute))
                )}
            </div>
        </ContactAccordion>
    );
};
