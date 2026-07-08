import { ArrowRightUpMd } from '@ringcentral/spring-icon';
import { Link, Icon } from '@ringcentral/spring-ui';

type InteractionLinkProps = {
    url: string;
};

export const InteractionLink = ({ url }: InteractionLinkProps) => {
    let urlObject;

    try {
        urlObject = new URL(url);
    } catch (e) {
        console.error('Parse URL error.');
    }

    return (
        <Link
            href={urlObject ? url : ''}
            target='_blank'
            variant='primary'
            className='typography-mainText inline-flex items-center gap-1 whitespace-normal break-all'
        >
            <span>{urlObject?.hostname || '-'}</span>
            <Icon symbol={ArrowRightUpMd} size='small' />
        </Link>
    );
};
