import { PanelHeaderWrapper } from './PanelHeader.styled';

type PropsType = {
    title: string;
    sticky?: boolean;
    className?: string;
};

export const PanelHeader = ({
    title,
    sticky = false,
    className,
}: PropsType) => {
    return (
        <PanelHeaderWrapper className={className} sticky={sticky}>
            {title}
        </PanelHeaderWrapper>
    );
};
