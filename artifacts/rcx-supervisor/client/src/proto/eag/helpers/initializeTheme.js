import { UserService } from '@ringcx/shared';

import { setBehaviorHandler } from './setBehaviorHandler';
import { $theme } from '../common/services/jupiter';

const isVodafoneBrand = UserService.isVodafoneBrand();

export function overwriteTheme(theme) {
    // use UserService.isVodafoneBrand() for tests
    return UserService.isVodafoneBrand()
        ? theme?.themeCategory
        : theme?.themeName;
}

export function initializeTheme($scope, refreshCallback) {
    $scope.theme = setBehaviorHandler($theme, function () {
        if ($scope) {
            $scope.$apply();
        }
    });

    $scope.$watch(
        () =>
            isVodafoneBrand
                ? $scope.theme?.value?.themeCategory
                : $scope.theme?.value?.themeName,
        function (newValue, oldValue) {
            if (newValue !== oldValue) {
                refreshCallback?.(newValue ?? '');
            }
        }
    );
}
