import { CallMd } from '@ringcentral/spring-icon';
import { Icon, Text } from '@ringcentral/spring-ui';

import {
    CallPreviewActions,
    type CallPreviewActionsProps,
} from './CallPreviewActions';
import { StyledCallPreviewCard } from './CallPreviewCard.styled';

type CallPreviewCardProps = Omit<CallPreviewActionsProps, 'size'> & {
    name: string;
    dialDestValue: string;
};

export const CallPreviewCard = (props: CallPreviewCardProps) => {
    const { name, dialDestValue, ...restProps } = props;

    return (
        <StyledCallPreviewCard selected>
            <div className='mb-6 flex flex-col gap-1'>
                <Text component='p' className='text-sm font-medium leading-5'>
                    {name}
                </Text>
                <Text
                    component='p'
                    className='text-neutral-b2 typography-subtitleMini text-sm leading-5'
                >
                    {dialDestValue}
                </Text>
            </div>
            <div className='flex w-full items-center justify-between'>
                <Icon
                    symbol={CallMd}
                    size='medium'
                    className='text-neutral-b3'
                />
                <div className='flex-shrink-1 flex min-w-0 items-center gap-2 pl-5'>
                    <CallPreviewActions {...restProps} />
                </div>
            </div>
        </StyledCallPreviewCard>
    );
};
