import {
    CONTACT_MANAGEMENT_HEADER_SUBTITLE,
    CONTACT_MANAGEMENT_HEADER_TITLE,
} from '../../../constants/testIds';

export type ContactHeaderProps = {
    title: string;
    subTitle?: string;
};

export const ContactHeader = ({ title, subTitle }: ContactHeaderProps) => {
    return (
        <div className='flex flex-col items-start'>
            <span
                className='typography-subtitleBold text-neutral-b0'
                data-aid={CONTACT_MANAGEMENT_HEADER_TITLE}
            >
                {title}
            </span>
            {subTitle && (
                <span
                    data-aid={CONTACT_MANAGEMENT_HEADER_SUBTITLE}
                    className='typography-descriptor text-neutral-b2 whitespace-normal break-all text-left'
                >
                    {subTitle}
                </span>
            )}
        </div>
    );
};
