import styled from 'styled-components';

import { BORDER_RADIUS } from '../constants';

export const SingleSelectWrapper = styled.div.attrs({
    className: 'single-select-wrapper',
})<{
    setWidth: boolean;
    inputPosition: 'left' | 'right' | undefined;
    dropdownWidth: string;
}>`
    flex-shrink: 0;
    width: ${({ setWidth, dropdownWidth }) =>
        setWidth ? dropdownWidth : '100%'};
    margin-left: ${({ inputPosition }) =>
        inputPosition === 'left' ? '-1px' : '0'};
    margin-right: ${({ inputPosition }) =>
        inputPosition === 'right' ? '-1px' : '0'};
`;

export const TextInputWrapper = styled.div`
    width: 100%;
`;

export const CompoundSelectWrapper = styled.div<{
    inputPosition?: 'left' | 'right';
}>`
    .MuiFormControl-root {
        width: 100%;
    }

    ${({ inputPosition }) => {
        if (inputPosition === 'right') {
            return `
                .single-select.eui-dropdown {
                    border-radius: ${BORDER_RADIUS}px 0 0 ${BORDER_RADIUS}px;
                }
                .single-select.eui-dropdown:hover,
                .single-select.eui-dropdown:focus{
                    z-index: 5;
                    position: absolute;
                }
                .single-select.eui-dropdown.single-select-error {
                    z-index: 2;
                    position: absolute;
                }

                [class*='StyledTextField'] {
                    border-radius: 0 ${BORDER_RADIUS}px ${BORDER_RADIUS}px 0;
                }

                [class*='StyledMergeLayoutContainer'] {
                    margin-bottom: 8px;
                }
            `;
        } else if (inputPosition === 'left') {
            return `
                .single-select.eui-dropdown {
                    border-radius: 0 ${BORDER_RADIUS}px ${BORDER_RADIUS}px 0;
                }
                .single-select.eui-dropdown:hover,
                .single-select.eui-dropdown:focus{
                    z-index: 5;
                    position: absolute;
                }
                .single-select.eui-dropdown.single-select-error {
                    z-index: 3;
                    position: absolute;
                }

                [class*='StyledTextField'] {
                    border-radius: ${BORDER_RADIUS}px 0 0  ${BORDER_RADIUS}px;
                    z-index: 2;
                    position: relative;
                }

                [class*='StyledMergeLayoutContainer'] {
                    margin-bottom: 8px;
                }
            `;
        }
    }}
`;

export const ErrorMessage = styled.span<{ inputPosition?: 'left' | 'right' }>`
    margin-top: ${({ inputPosition }) =>
        inputPosition !== undefined ? '0' : '8px'};
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.accent.firetruck};
`;

export const InfoText = styled.span`
    font-size: 12px;
    color: ${({ theme }) => theme.colors.gray[850]};
`;
