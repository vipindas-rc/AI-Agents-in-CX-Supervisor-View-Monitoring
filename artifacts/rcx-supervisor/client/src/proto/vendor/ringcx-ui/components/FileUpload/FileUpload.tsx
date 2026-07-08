import type { ChangeEvent, FC } from 'react';
import { Fragment, useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import {
    HiddenInput,
    Label,
    StyledDeleteButton,
    StyledDoc,
    StyledIconButton,
    StyledTextEclipse,
    StyleLinkButton,
    UploadedFile,
    UploadedFilesStatus,
} from './FileUpload.styled';
import type {
    IBaseFileUpload,
    IMultipleFilesUpload,
    ISingleFileUpload,
} from './types';
import { AddNew, Trashcan } from '../../icons';
import { i18next } from '../../services/translate';
import zIndexes from '../../theme/zindexes';
import Tooltip from '../Tooltip';

//TODO: EVAA-16712 Mount the tooltip as child prop to avoid z-index issues
const hackyTooltipPropsForPopper = {
    disablePortal: true,
    modifiers: {
        preventOverflow: {
            enabled: true,
            boundariesElement: 'scrollParent',
        },
    },
};

const BaseFilesUpload: FC<IBaseFileUpload> = ({
    files,
    accept,
    onChange,
    disabled = false,
    allowMultipleFiles,
    selectFileText: selectFileTextProp,
    deleteFileText: deleteFileTextProp,
    maxFiles,
    i18n = i18next,
}) => {
    const { t } = useTranslation(undefined, { i18n });

    const handleSetFile = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (!e.target) {
                return;
            }

            const newFiles = e.target.files ? Array.from(e.target.files) : [];

            onChange?.([...files, ...newFiles]);
        },
        [files, onChange]
    );

    const handleUnsetFile = useCallback(
        (fileToRemove: File) => {
            const newFiles = files.filter((file) => file !== fileToRemove);
            onChange?.(newFiles);
        },
        [files, onChange]
    );

    const selectFileText = useMemo(
        () => selectFileTextProp ?? t('FILES_UPLOAD_INPUT.SELECT_UPLOAD_FILE'),
        [selectFileTextProp, t]
    );

    const restrictAddMoreFiles = useMemo(() => {
        if (maxFiles === undefined) {
            return false;
        }
        return files.length >= maxFiles;
    }, [files, maxFiles]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (restrictAddMoreFiles) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('icon-button')?.click();
            }
        },
        [restrictAddMoreFiles]
    );

    const linkConstruction = (
        <Fragment>
            <HiddenInput
                accept={accept}
                id='icon-button'
                data-aid='fileInput'
                onChange={handleSetFile}
                multiple={allowMultipleFiles}
                disabled={restrictAddMoreFiles}
                type='file'
            />
            <Tooltip
                title={
                    restrictAddMoreFiles
                        ? t('FILES_UPLOAD_INPUT.MAX_FILES_REACHED')
                        : ''
                }
                PopperProps={hackyTooltipPropsForPopper}
            >
                <Label htmlFor='icon-button'>
                    <StyleLinkButton
                        title={selectFileText}
                        disabled={restrictAddMoreFiles}
                        icon={<AddNew data-aid='addNew' />}
                        type='file'
                        onKeyDown={handleKeyDown}
                    />
                </Label>
            </Tooltip>
        </Fragment>
    );

    const deleteFileText = useMemo(
        () => deleteFileTextProp ?? t('FILES_UPLOAD_INPUT.DELETE'),
        [deleteFileTextProp, t]
    );

    const deleteAll = useCallback(() => {
        onChange?.([]);
    }, [onChange]);

    const filesConstruction = files.map((file, index) => {
        const fileName = (file && file.name) || '';
        const fileKey = `${fileName}-${index}-${file.size.toFixed(2)}`;
        const unsetFile = () => {
            handleUnsetFile(file);
        };
        return (
            <UploadedFile key={fileKey}>
                <StyledDoc />
                <StyledTextEclipse
                    tooltipMsg={fileName}
                    popperProps={{
                        style: { zIndex: zIndexes.modal },
                    }}
                >
                    {fileName}
                </StyledTextEclipse>
                <Tooltip
                    title={deleteFileText}
                    PopperProps={hackyTooltipPropsForPopper}
                >
                    <StyledIconButton
                        disabled={disabled}
                        size='medium'
                        onClick={unsetFile}
                    >
                        <Trashcan />
                    </StyledIconButton>
                </Tooltip>
            </UploadedFile>
        );
    });

    if (files.length === 0) {
        return linkConstruction;
    }

    return (
        <Fragment>
            {allowMultipleFiles ? linkConstruction : null}
            {allowMultipleFiles && files?.length > 0 ? (
                <UploadedFilesStatus>
                    <span>
                        {t('FILES_UPLOAD_INPUT.FILES_UPLOADED', {
                            count: files.length,
                        })}
                    </span>
                    <StyledDeleteButton variant='text' onClick={deleteAll}>
                        {t('FILES_UPLOAD_INPUT.DELETE_ALL')}
                    </StyledDeleteButton>
                </UploadedFilesStatus>
            ) : null}
            {filesConstruction}
        </Fragment>
    );
};

export const MultipleFilesUpload: FC<IMultipleFilesUpload> = ({ ...rest }) => {
    return <BaseFilesUpload {...rest} allowMultipleFiles={true} />;
};

export const FileUpload: FC<ISingleFileUpload> = ({
    onChange,
    file,
    ...rest
}) => {
    const files = file ? [file] : [];
    const onFilesChange = (selectedFiles: File[]) => {
        onChange?.(selectedFiles[0] ?? null);
    };

    return (
        <BaseFilesUpload
            {...rest}
            files={files}
            onChange={onFilesChange}
            allowMultipleFiles={false}
        />
    );
};
