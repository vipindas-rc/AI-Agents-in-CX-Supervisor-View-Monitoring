import {
    suiJunoLight,
    suiJunoDark,
    suiHighContrast,
    suiSkyBlue,
    suiEggplantPurple,
    suiVodafoneRich,
} from '@ringcentral/spring-ui';
import { UserService } from '@ringcx/shared';

// extend this when brands grows
const getBrandLightTheme = () => {
    if (UserService.isVodafoneBrand()) {
        return suiVodafoneRich;
    }
    return suiJunoLight;
};

// refer to https://git.ringcentral.com/Fiji/Fiji/-/blob/develop/project/common/ui/common/src/constant/theme.ts for more details
export const getSpringTheme = (themeName?: string) => {
    switch (themeName) {
        case 'rcDark':
        case 'dark':
            return suiJunoDark;
        case 'rcHighContrast':
        case 'highContrast':
            return suiHighContrast;
        case 'rcBlue':
            return suiJunoLight;
        case 'rcJupiterBlue':
            return suiSkyBlue;
        case 'rcPhoenix':
            return suiEggplantPurple;
        default:
            return getBrandLightTheme();
    }
};
