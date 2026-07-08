import { EmptyStateImageStyled } from './EmptyStateImage.styled';
import {
    NoActiveCallsImage,
    EmptyMessagesImage,
    NoDigitalQueueImage,
    NoInteractionHistory,
    StartDialingImage,
    NoLeadsImage,
    GettingLeadsImage,
} from '../assets';

export const EmptyStateImage = ({ type }: { type: string }) => {
    let graphic = null;
    switch (type) {
        case 'NoActiveCalls':
            graphic = <NoActiveCallsImage />;
            break;

        case 'EmptyMessages':
            graphic = <EmptyMessagesImage />;
            break;

        case 'NoDigitalQueue':
            graphic = <NoDigitalQueueImage />;
            break;

        case 'NoInteractionHistory':
            graphic = <NoInteractionHistory />;
            break;

        case 'StartDialing':
            graphic = <StartDialingImage />;
            break;

        case 'NoLeads':
            graphic = <NoLeadsImage />;
            break;

        case 'NoVoiceQueue':
            graphic = <NoLeadsImage />;
            break;

        case 'GettingLeads':
            graphic = <GettingLeadsImage />;
            break;

        default:
            break;
    }

    return graphic ? (
        <EmptyStateImageStyled>{graphic}</EmptyStateImageStyled>
    ) : null;
};
