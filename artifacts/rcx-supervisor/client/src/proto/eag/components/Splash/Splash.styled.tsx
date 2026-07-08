import { styled, css, RcTypography, spacing } from '@ringcentral/juno';
import { Button } from '@ringcx/ui';

import { SPLASH_TYPES } from '../../constants/emptyStates';

export const Container = styled.div<{
    splashType: string;
    isJustSubtext?: boolean;
}>`
    height: 100%;
    display: flex;
    flex-flow: column;
    align-items: center;

    ${({ splashType }: { splashType: string }) => {
        return (
            (splashType === SPLASH_TYPES.SIDE_PANEL ||
                splashType === SPLASH_TYPES.GRAPHIC_PANEL) &&
            css`
                ${SplashWrapper} {
                    padding-top: 0;
                }

                &:before {
                    content: '';
                    height: 15%;
                    width: 100%;
                    min-height: 16px;
                }
            `
        );
    }}

    ${({ splashType }: { splashType: string }) => {
        return (
            splashType === SPLASH_TYPES.SIDE_PANEL &&
            css`
                ${MessageWrapper} {
                    min-width: initial;
                    max-width: initial;
                    padding: 0 24px;
                }
            `
        );
    }}

    ${({ isJustSubtext }: { isJustSubtext?: boolean }) => {
        return (
            isJustSubtext &&
            css`
                ${MessageWrapper} {
                    margin-top: 0;
                }

                &:before {
                    content: none;
                }
            `
        );
    }}

    ${({ splashType }: { splashType: string }) => {
        return (
            splashType === SPLASH_TYPES.START_WORKING &&
            css`
                ${SplashWrapper} {
                    padding-top: 0;
                    &:before {
                        content: '';
                        height: 16px;
                        width: 100%;
                    }
                }

                ${MessageWrapper} {
                    margin-top: ${spacing(16)};
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0 24px;
                }
                ${MessageText} {
                }
                ${MessageSubText} {
                    margin-top: ${spacing(4)};
                }
            `
        );
    }}

    ${({ splashType }: { splashType: string }) => {
        return (
            splashType === SPLASH_TYPES.PLAIN_TEXT_PANEL &&
            css`
                justify-content: center;

                ${SplashWrapper} {
                    padding-top: 0;
                }

                ${MessageWrapper} {
                    margin-top: 0;
                }

                ${MessageSubText} {
                    margin-top: 10px;
                }
            `
        );
    }}
`;

export const SplashWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding-top: 111px;
`;

export const BackgroundImageWrapper = styled.div`
    display: flex;
    align-items: center;
    height: 228px;

    svg {
        height: 100%;
    }
`;

export const MessageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 600px;
    min-width: 300px;
    margin-top: ${spacing(8)};
`;

export const MessageText = styled(RcTypography)`
    text-align: center;
`;

MessageText.defaultProps = {
    color: 'neutral.f06',
    component: 'div',
    variant: 'headline1',
};

export const MessageSubText = styled(RcTypography)`
    width: 100%;
    max-width: 400px;
    margin-top: ${spacing(3)};
    text-align: center;
`;

MessageSubText.defaultProps = {
    color: 'neutral.f04',
    component: 'div',
};

export const ActionButton = styled(Button)`
    && {
        font-size: 14px;
        margin-top: 20px;
        min-width: 152px;
    }
`;
