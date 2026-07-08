import type { FC } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';

import {
    CUSTOMER_SUPPORT_LINK,
    PRIVACY_NOTICE,
    TERMS_OF_SERVICE,
} from '@ringcx/shared';
import { Controller } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import {
    Asterisk,
    ContentWrapper,
    DescriptionWrapper,
    FeedbackLabel,
    StyledDialog,
    StyledFormTextArea,
} from './ReportAnIssue.styled';
import type {
    IReportForm,
    ReportAnIssueModalProps,
} from './types/ReportAnIssue';
import { IReportFormFields } from './types/ReportAnIssue';
import { TEST_AID } from '../../constants/index';
import { renderAutocompleteControl } from '../../helpers/form/inputs/renderAutocompleteControl';
import { useConfigForm } from '../../hooks';
import { i18next } from '../../services/translate';
import { Button } from '../Button';
import { NotificationTypes } from '../constants/Notifications';
import { MultipleFilesUpload } from '../FileUpload';
import InfoBar from '../InfoBar';
import { LinkText } from '../LinkText';
import { Toast } from '../Toast';

const MAX_FILES = 10;
const MAX_FILE_SIZE_IN_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MB * 1024 * 1024; // 10MB in bytes
const MAX_DESCRIPTION_LENGTH = 2000;

export const ReportAnIssueModal: FC<ReportAnIssueModalProps> = memo(
    ({ open, setOpen, issueTitle, classNames, i18n = i18next, onReport }) => {
        const { t } = useTranslation(undefined, { i18n });
        const requiredError = t('FEEDBACK.MODAL.VALIDATION.REQUIRED');
        const defaultIssueTitle = t('FEEDBACK.MODAL.DEFAULT_INPUT_TITLE');
        const maxFilesError = t('FEEDBACK.MODAL.FILES.MAX_FILES_ERROR', {
            count: MAX_FILES,
        });
        const maxSizeError = t('FEEDBACK.MODAL.FILES.MAX_SIZE_ERROR', {
            size: MAX_FILE_SIZE_IN_MB,
        });
        const addToast = Toast();
        const [isLoading, setIsLoading] = useState(false);

        const title = useMemo(() => {
            return issueTitle || defaultIssueTitle;
        }, [issueTitle, defaultIssueTitle]);

        const validationScheme: Yup.AnyObjectSchema = useMemo(
            () =>
                Yup.object({
                    [IReportFormFields.DESCRIPTION]:
                        Yup.string().required(requiredError),
                    [IReportFormFields.WHEN]: Yup.string(),
                    [IReportFormFields.ATTACHMENTS]: Yup.array()
                        .default([])
                        .test(
                            'maxFiles',
                            maxFilesError,
                            (files) => !files || files.length <= MAX_FILES
                        )
                        .test('maxSize', maxSizeError, (files) => {
                            if (!files) {
                                return true;
                            }

                            const totalSize = files.reduce(
                                (sum, file) => sum + file.size,
                                0
                            );

                            return totalSize <= MAX_FILE_SIZE;
                        }),
                }),
            [maxFilesError, maxSizeError, requiredError]
        );

        const whenOptions = useMemo(() => {
            return [
                {
                    id: 'last_30min',
                    label: t('FEEDBACK.MODAL.WHEN.OPTIONS.30_MIN'),
                },
                {
                    id: 'last_1hour',
                    label: t('FEEDBACK.MODAL.WHEN.OPTIONS.1_HOUR'),
                },
                {
                    id: 'last_2hours',
                    label: t('FEEDBACK.MODAL.WHEN.OPTIONS.2_HOURS'),
                },
                {
                    id: 'last_more_2hours',
                    label: t('FEEDBACK.MODAL.WHEN.OPTIONS.MORE'),
                },
            ];
        }, [t]);

        const {
            control,
            handleSubmit,
            reset,
            formState,
            setError,
            watch,
            trigger,
        } = useConfigForm<IReportForm>({
            defaultValues: {
                [IReportFormFields.TITLE]: title,
                [IReportFormFields.DESCRIPTION]: '',
                [IReportFormFields.WHEN]: '',
                [IReportFormFields.ATTACHMENTS]: [],
            },
            validationScheme,
        });
        const { errors } = formState;

        const files = watch(IReportFormFields.ATTACHMENTS);

        useEffect(() => {
            trigger(IReportFormFields.ATTACHMENTS);
        }, [files, trigger]);

        const onClose = () => {
            setOpen(false);
            reset();
        };

        const onSubmit = async (data: IReportForm) => {
            try {
                setIsLoading(true);
                await onReport({
                    ...data,
                    title,
                });
                setIsLoading(false);

                onClose();

                addToast.success({
                    text: t('FEEDBACK.MODAL.BANNER.SUCCESS'),
                });
            } catch (e) {
                setIsLoading(false);
                window.console.error(e);
                setError(IReportFormFields.ROOT, {
                    message: t('FEEDBACK.MODAL.INTERNAL_ERROR'),
                });
            }
        };

        return (
            <StyledDialog
                scrollable
                open={open}
                onClose={onClose}
                dialogTitle={t('FEEDBACK.MODAL.TITLE')}
                className={classNames}
                content={
                    <ContentWrapper>
                        {errors.attachments || errors.root ? (
                            <InfoBar type={NotificationTypes.ERROR}>
                                {errors.attachments?.message ||
                                    errors.root?.message}
                            </InfoBar>
                        ) : (
                            <InfoBar type={NotificationTypes.INFO}>
                                <Trans
                                    i18n={i18n}
                                    i18nKey='FEEDBACK.MODAL.REPORT_INFO'
                                    components={{
                                        support_link: (
                                            <LinkText
                                                to={CUSTOMER_SUPPORT_LINK}
                                            />
                                        ),
                                    }}
                                />
                            </InfoBar>
                        )}
                        <div>
                            <FeedbackLabel className='feedback-label'>
                                {t('FEEDBACK.MODAL.LABEL_DESCRIPTION')}
                                <Asterisk>*</Asterisk>
                            </FeedbackLabel>
                            <Controller
                                name={IReportFormFields.DESCRIPTION}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <StyledFormTextArea
                                        error={!!fieldState.error}
                                        message={
                                            fieldState.error
                                                ? requiredError
                                                : ''
                                        }
                                        placeholder={t(
                                            'FEEDBACK.MODAL.PLACEHOLDER_DESCRIPTION'
                                        )}
                                        maxLength={MAX_DESCRIPTION_LENGTH}
                                        dataAid={TEST_AID.FEEDBACK_DESCRIPTION}
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <FeedbackLabel className='feedback-label'>
                                {t('FEEDBACK.MODAL.WHEN.LABEL')}
                            </FeedbackLabel>
                            <Controller
                                name={IReportFormFields.WHEN}
                                control={control}
                                render={renderAutocompleteControl({
                                    placeholder: t(
                                        'FEEDBACK.MODAL.WHEN.PLACEHOLDER'
                                    ),
                                    dataAid: TEST_AID.FEEDBACK_WHEN,
                                    data: whenOptions,
                                    disableClearable: false,
                                })}
                            />
                        </div>
                        <div>
                            <Controller
                                name={IReportFormFields.ATTACHMENTS}
                                control={control}
                                render={({ field }) => (
                                    <MultipleFilesUpload
                                        maxFiles={MAX_FILES}
                                        files={field.value}
                                        onChange={field.onChange}
                                        disabled={false}
                                    />
                                )}
                            />
                        </div>
                        <DescriptionWrapper>
                            <Trans
                                i18n={i18n}
                                i18nKey='FEEDBACK.MODAL.TERMS'
                                components={{
                                    tos_link: (
                                        <LinkText to={TERMS_OF_SERVICE} />
                                    ),
                                    privacy_link: (
                                        <LinkText to={PRIVACY_NOTICE} />
                                    ),
                                }}
                            />
                        </DescriptionWrapper>
                    </ContentWrapper>
                }
                actions={[
                    <Button
                        key='action1'
                        variant='text'
                        onClick={onClose}
                        data-aid={TEST_AID.FEEDBACK_CANCEL_BUTTON}
                    >
                        {t('FEEDBACK.MODAL.BUTTON.CANCEL')}
                    </Button>,
                    <Button
                        key='action2'
                        color='primary'
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        data-aid={TEST_AID.FEEDBACK_SEND_BUTTON}
                        loading={isLoading}
                    >
                        {t('FEEDBACK.MODAL.BUTTON.SEND')}
                    </Button>,
                ]}
                disableBackdropClick
            />
        );
    }
);

ReportAnIssueModal.displayName = 'ReportAnIssueModal';
