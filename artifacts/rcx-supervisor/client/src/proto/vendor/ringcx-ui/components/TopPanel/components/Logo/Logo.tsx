import type { FC, Dispatch, SetStateAction } from 'react';
import { memo, useState, useEffect } from 'react';

import { isBiz } from '@ringcx/shared';

import { BRAND_IMG_BASE_PATH, BIZ_IMAGE_BASE_PATH } from './constants';
import { StyledLogo } from './Logo.styled';
import type { ILogo } from './types/Logo';

let currentLogoSrc = '';

const Logo: FC<ILogo> = ({
    mainAccountId,
    subAccountId,
    onClick,
    defaultLogo,
    withToggle = false,
    alt = 'logo',
}) => {
    const isBizEnv = isBiz();
    const basePath = isBizEnv ? BIZ_IMAGE_BASE_PATH : BRAND_IMG_BASE_PATH;

    const defaultSource = `${BRAND_IMG_BASE_PATH}${defaultLogo}_default_v2.svg?v=5`;
    const mainAccountLogo = `${basePath}${mainAccountId}_large.png?v=5`;
    const subAccountLogo = `${basePath}${subAccountId}_large.png?v=5`;

    const [logoSrc, setLogoSrc] = useState<string>(currentLogoSrc);

    useEffect(() => {
        if (mainAccountId !== undefined && subAccountId === undefined) {
            if (mainAccountId) {
                setupLogo([mainAccountLogo, defaultSource], setLogoSrc);
            }
        } else if (mainAccountId !== undefined && subAccountId !== undefined) {
            if (mainAccountId && subAccountId) {
                setupLogo(
                    [subAccountLogo, mainAccountLogo, defaultSource],
                    setLogoSrc
                );
            }
        } else {
            setupLogo([defaultSource], setLogoSrc);
        }
    }, [
        defaultSource,
        mainAccountId,
        mainAccountLogo,
        subAccountId,
        subAccountLogo,
    ]);

    return (
        <StyledLogo {...{ withToggle, onClick }}>
            {logoSrc && <img src={logoSrc} alt={alt} />}
        </StyledLogo>
    );
};

async function setupLogo(
    sources: string[],
    setter: Dispatch<SetStateAction<string>>
): Promise<void> {
    currentLogoSrc = await pickSrc(sources);

    setter(currentLogoSrc);
}

async function pickSrc(sources: string[]): Promise<string> {
    const [url, ...rest] = sources;

    if (!url) {
        return Promise.resolve(currentLogoSrc);
    }

    return new Promise((resolve) => {
        const img = document.createElement('img');

        img.addEventListener('load', () => resolve(url));
        img.addEventListener('error', () => resolve(pickSrc(rest)));

        img.src = url;
    });
}

export default memo(Logo);
