import type { FC } from 'react';

import {
    Container,
    MessageSubText,
    MessageText,
    MessageWrapper,
    SplashWrapper,
    BackgroundImageWrapper,
} from './Splash.styled';
import type { ISplash } from './types/Splash';
import { EmptyStateImage } from '../../components/Splash/components/EmptyStateImage';
import { SPLASH_TYPES } from '../../constants/emptyStates';
import {
    SPLASH_CONTAINER,
    SPLASH_MESSAGE_SUBTEXT,
    SPLASH_MESSAGE_TEXT,
    SUBTEXT_SPLASH_CONTAINER,
} from '../../constants/testIds';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { withBrandTheme } from '../../helpers/withBrandTheme';

export const Splash: FC<ISplash> = withBrandTheme((props: ISplash) => {
    const { text, subText, button, splashType, bgImage, iconName } = props;
    let { icon } = props;

    if (!icon && iconName) {
        icon = <EmptyStateImage type={iconName} />;
    }

    // return just the message wrapper for when there's no text and icon but just subtext
    const isJustSubtext = !text && !icon && !iconName && !!subText;

    return isJustSubtext ? (
        <Container data-aid={SUBTEXT_SPLASH_CONTAINER} {...props} isJustSubtext>
            <MessageWrapper>
                {subText && (
                    <MessageSubText
                        data-aid={SPLASH_MESSAGE_SUBTEXT}
                        id='splash-msg-sub-txt-id'
                        {...{
                            variant:
                                splashType === SPLASH_TYPES.SIDE_PANEL
                                    ? 'subheading1'
                                    : splashType ===
                                        SPLASH_TYPES.PLAIN_TEXT_PANEL
                                      ? 'body1'
                                      : 'title1',
                        }}
                    >
                        {subText}
                    </MessageSubText>
                )}
            </MessageWrapper>

            {button}
        </Container>
    ) : (
        <Container data-aid={SPLASH_CONTAINER} {...props}>
            <SplashWrapper>
                {icon}
                {bgImage && (
                    <BackgroundImageWrapper>{bgImage}</BackgroundImageWrapper>
                )}
                <MessageWrapper>
                    {text && (
                        <MessageText
                            data-aid={SPLASH_MESSAGE_TEXT}
                            id='splash-msg-txt-id'
                            {...{
                                variant:
                                    splashType === SPLASH_TYPES.START_WORKING
                                        ? 'display1'
                                        : splashType ===
                                            SPLASH_TYPES.PLAIN_TEXT_PANEL
                                          ? 'title2'
                                          : 'headline1',
                            }}
                        >
                            {text}
                        </MessageText>
                    )}
                    {subText && (
                        <MessageSubText
                            data-aid={SPLASH_MESSAGE_SUBTEXT}
                            id='splash-msg-sub-txt-id'
                            {...{
                                variant:
                                    splashType === SPLASH_TYPES.SIDE_PANEL
                                        ? 'subheading1'
                                        : splashType ===
                                                SPLASH_TYPES.PLAIN_TEXT_PANEL ||
                                            splashType ===
                                                SPLASH_TYPES.GRAPHIC_PANEL
                                          ? 'body1'
                                          : 'title1',
                            }}
                        >
                            {subText}
                        </MessageSubText>
                    )}
                </MessageWrapper>
                {button}
            </SplashWrapper>
        </Container>
    );
});

export default CreateAngularModule(
    'splash',
    Splash,
    ['text', 'subText', 'icon', 'iconName', 'button', 'splashType', 'bgImage'],
    []
);
