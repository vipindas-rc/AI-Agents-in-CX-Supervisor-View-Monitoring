import styled from 'styled-components';

import type { IStyleMenuItem } from './types/MenuItem';

export const MenuItemStyled = styled.a<IStyleMenuItem>`
    && {
        text-decoration: none;

        & > *:first-child {
            display: block;
            user-select: none;
            overflow: hidden;
            cursor: pointer;
            color: ${({ selected, theme }) =>
                theme.colors.gray[selected ? 0 : 900]};
            background-color: ${({ selected, theme }) =>
                selected ? theme.colors.primary : null};
            margin: 10px 12px;
            padding: 7px 12px;
            font-weight: ${({ selected }) => (selected ? 500 : 400)};
            letter-spacing: 0.25px;
            line-height: 20px;
            border-radius: 20px;
            max-width: ${({ selected }) =>
                selected ? 'calc(100% - 25px)' : 'auto'};
            &:hover,
            &:focus {
                text-decoration: none;
                color: ${({ theme, selected }) =>
                    selected ? theme.colors.gray[0] : theme.colors.gray[900]};
                background-color: ${({ selected, theme }) =>
                    selected ? null : theme.colors.gray[400] + '33'};
            }

            ${(p) =>
                p.selected
                    ? `
					background-color: ${p.theme.colors.primary};
					color: white; 
				`
                    : null}
        }
    }
`;
