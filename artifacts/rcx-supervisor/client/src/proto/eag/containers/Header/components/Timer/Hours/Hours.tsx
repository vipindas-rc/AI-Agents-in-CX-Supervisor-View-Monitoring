import { Fragment } from 'react';

import CompoundTimer from 'react-compound-timer';

const Hours = () => (
    <Fragment>
        <CompoundTimer.Hours />:
        <CompoundTimer.Minutes />:
        <CompoundTimer.Seconds />
    </Fragment>
);

export default Hours;
