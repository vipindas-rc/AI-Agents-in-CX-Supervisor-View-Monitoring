import type { FC, ReactNode } from 'react';
import { useMemo, useState, useEffect, Fragment } from 'react';

import {
    MultiSelect,
    Button,
    FormTextArea,
    Spinner,
    Dialog as StyledDialog,
    Toast,
} from '@ringcx/ui';

import { DialogStoryWrapper, Row } from './ReportCall.styled';
import type { IReportCall, SelectedItemsIds } from './types';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import translate from '../../helpers/translate';

const ReportCall: FC<IReportCall> = ({
    enableReportModal,
    uii,
    closeReportModal,
    listReportType,
    postReportCall,
    origin,
    returnFocusRef,
}) => {
    const [validation, setValidation] = useState(false);
    const [submitState, setSubmitState] = useState<boolean>(false);
    const [shouldReturnFocus, setShouldReturnFocus] = useState<boolean>(false);

    const [selectedItemsIds, setSelectedItemsIds] = useState<SelectedItemsIds>(
        []
    );
    const [userNote, setUserNote] = useState<string>('');

    const listIssue = useMemo(() => listReportType(), []);

    const listTranslatedIssue = listIssue.map((issue) => {
        return {
            ...issue,
            displayName: translate(`REPORT_CALL.ISSUES.${issue.id}`),
        };
    });
    const addToast = Toast();

    const onCancelModal = () => {
        setShouldReturnFocus(true);
        closeReportModal();
        setSelectedItemsIds([]);
        setUserNote('');
    };

    const handleOnSubmitReport = () => {
        const typeOfIssue: string[] | undefined = [];
        setSubmitState(true);
        selectedItemsIds.forEach(function (issue) {
            const indexOfIssue = parseInt(issue) - 1;
            typeOfIssue.push(listIssue[indexOfIssue].displayName);
        });

        postReportCall(uii, typeOfIssue, userNote, origin)
            .then(function (response: any) {
                const { status = '', message = '' } = response;
                setShouldReturnFocus(true);
                closeReportModal();
                setSubmitState(false);
                if (status === 'info') {
                    addToast.success({
                        text: message,
                        hasCloseButton: true,
                        uniqId: 2,
                    });
                    setSelectedItemsIds([]);
                    setUserNote('');
                } else {
                    addToast.error({
                        text: message,
                        hasCloseButton: true,
                        uniqId: 1,
                    });
                }
            })
            .catch(function (error: any) {
                console.error(
                    'Report call quality api failed for posting data',
                    error
                );
            });
    };

    useEffect(() => {
        //Value of 'others' stored in database is 6
        const indexOfOther = selectedItemsIds.findIndex((id) => id === '6');
        if (indexOfOther !== -1 && userNote.trim() === '') {
            setValidation(true);
        } else {
            setValidation(false);
        }
    }, [selectedItemsIds, userNote, validation]);

    // Return focus after dialog closes
    useEffect(() => {
        if (
            !enableReportModal &&
            shouldReturnFocus &&
            returnFocusRef?.current
        ) {
            // Use setTimeout to ensure dialog cleanup is complete
            const timeoutId = setTimeout(() => {
                returnFocusRef.current?.focus();
                setShouldReturnFocus(false);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [enableReportModal, shouldReturnFocus, returnFocusRef]);

    const reportCallForm = useMemo<ReactNode>(
        () => (
            <Fragment>
                <Row className='report-dropdown'>
                    <MultiSelect
                        required
                        selectedItemsIds={selectedItemsIds}
                        title={translate('REPORT_CALL.MODALS.DROPDOWN_LABEL')}
                        size='small'
                        error={false}
                        message=''
                        useDefaultSort={false}
                        data={{
                            items: listTranslatedIssue,
                        }}
                        disabled={submitState}
                        placeholder={translate(
                            'REPORT_CALL.MULTISELECT_PLACEHOLDER'
                        )}
                        selectAllText={translate('REPORT_CALL.SELECT_ALL_TEXT')}
                        deselectAllText={translate(
                            'REPORT_CALL.DESELECT_ALL_TEXT'
                        )}
                        noResultsFoundText={translate(
                            'REPORT_CALL.NO_RESULT_FOUND'
                        )}
                        nothingAvailableText={translate(
                            'REPORT_CALL.NOTHING_AVAILABLE'
                        )}
                        onChange={setSelectedItemsIds}
                    />
                </Row>
                <Row>
                    <label> {translate('REPORT_CALL.NOTES')} </label>
                    <FormTextArea
                        onChange={setUserNote}
                        value={userNote}
                        placeholder={translate('REPORT_CALL.NOTES_PLACEHOLDER')}
                        error={validation}
                        message={
                            validation
                                ? translate('REPORT_CALL.REQUIRED')
                                : undefined
                        }
                        disabled={submitState}
                    />
                </Row>
            </Fragment>
        ),
        [listReportType, selectedItemsIds, validation, userNote, submitState]
    );

    return (
        <DialogStoryWrapper>
            <StyledDialog
                className='dialog-report-call responsive-dialog'
                open={enableReportModal}
                onClose={onCancelModal}
                dialogTitle={translate('REPORT_CALL.MODALS.TITLE')}
                closeButtonText={translate('GENERICS.ACTIONS.CLOSE')}
                content={reportCallForm}
                actions={[
                    <Button
                        key='cancel'
                        variant='text'
                        color='primary'
                        onClick={onCancelModal}
                        disabled={submitState}
                    >
                        {translate('REPORT_CALL.MODALS.CANCEL')}
                    </Button>,
                    <Button
                        key='submit'
                        className='report-submit'
                        disabled={
                            selectedItemsIds.length === 0 ||
                            validation ||
                            submitState
                        }
                        onClick={handleOnSubmitReport}
                    >
                        {submitState && <Spinner size='small' />}
                        {!submitState && translate('REPORT_CALL.MODALS.REPORT')}
                    </Button>,
                ]}
                disableBackdropClick
            />
        </DialogStoryWrapper>
    );
};

export { ReportCall };

export default CreateAngularModule('reportCall', ReportCall, [
    'enableReportModal',
    'uii',
    'listReportType',
    'closeReportModal',
    'postReportCall',
    'origin',
]);
