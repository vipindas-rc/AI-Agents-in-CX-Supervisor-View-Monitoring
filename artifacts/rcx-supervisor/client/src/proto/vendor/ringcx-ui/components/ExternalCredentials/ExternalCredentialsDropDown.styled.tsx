import styled from 'styled-components';

import { Button } from '../Button';

export const ExtCredentialsWrapper = styled.div`
    display: flex;
    gap: 10px;
    align-items: flex-end;
    margin-bottom: 20px;
`;

export const FlexRow = styled.div`
    flex: 1;
`;

export const StyleButton = styled(Button)`
    && {
        height: 32px;
        font-size: 14px;
    }
`;
