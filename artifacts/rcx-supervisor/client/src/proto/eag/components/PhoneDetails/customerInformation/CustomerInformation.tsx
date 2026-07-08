import type { FC } from 'react';
import { useState } from 'react';

import { CustomerInformationStyled } from './CustomerInformation.styled';
import type { ICustomerInformation } from './types/CustomerInformation';
import { CUSTOMER_INFO } from '../../../constants/testIds';

export const CustomerInformation: FC<ICustomerInformation> = ({
    id,
    loadFrame,
}) => {
    const [reLoad, setLoad] = useState(true);
    if (reLoad) {
        loadFrame(id);
        setLoad(false);
    }

    return (
        <CustomerInformationStyled>
            <div id={id} data-aid={CUSTOMER_INFO}></div>
        </CustomerInformationStyled>
    );
};
