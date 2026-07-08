import { EmptyState } from './components/EmptyState';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import injector from '../../helpers/injector';

export const MyCalls = ({ setNewCall }: { setNewCall?: () => void }) => {
    const isContentEmpty = true;
    const SessionSvc = injector('SessionSvc');

    const isEmptyVoiceQueuesOrDgSelected =
        SessionSvc?.isEmptyVoiceQueuesOrDgSelected?.();

    return isContentEmpty ? (
        <EmptyState
            onCall={setNewCall}
            isEmptyVoiceQueuesOrDgSelected={isEmptyVoiceQueuesOrDgSelected}
            iconType={
                isEmptyVoiceQueuesOrDgSelected
                    ? 'NoVoiceQueue'
                    : 'NoActiveCalls'
            }
        />
    ) : (
        'TODO: Calls content'
    );
};

export default CreateAngularModule('myCalls', MyCalls, ['setNewCall']);
