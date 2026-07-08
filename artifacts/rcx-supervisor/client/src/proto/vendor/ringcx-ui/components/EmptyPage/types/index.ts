import type { InfoPageProps } from '../../InfoPage';

export type IEmptyPage = Pick<
    InfoPageProps,
    'title' | 'subtitle' | 'buttonText' | 'onClick'
>;
