import { memo, useEffect, useState } from 'react';

import { FileUpload } from '../../../FileUpload';
import FormControl from '../../../FormControl/FormControl';
import type { IToolTipProps } from '../../../Tooltip/types/Tooltip';
import { isValidKeyFormat } from '../../helpers';

type Props = {
    title: string;
    maxSizeError: string;
    formatError: string;
    selectFileText: string;

    value?: string;
    required?: boolean;
    highlightError?: boolean;
    errorMessage?: string;
    dataAid?: string;
    fieldNameTooltip?: {
        message: string;
        placement?: IToolTipProps['placement'];
    };
    onChange?: (content: string) => void;
};

const maxSize = 1 * 1024 * 1024; // 1MB

const KeyReader = ({
    title,
    maxSizeError,
    formatError,
    selectFileText,
    value,
    required = false,
    highlightError = true,
    errorMessage = '',
    dataAid,
    fieldNameTooltip,
    onChange,
}: Props) => {
    const [error, setError] = useState('');
    const [file, setFile] = useState<Nullable<File>>(null);

    useEffect(() => {
        if (!file && value) {
            const uploadedFile = new File([value], 'private_key_uploaded.pem', {
                type: 'text/plain',
            });
            setFile(uploadedFile);
        }
    }, [file, value]);

    const handleFileChange = (newFile: Nullable<File>) => {
        if (newFile) {
            if (newFile.size > maxSize) {
                setError(maxSizeError);
                onChange?.('');
            } else {
                const reader = new FileReader();
                reader.onload = () => {
                    const content = reader.result as string;
                    onChange?.(content);
                    if (isValidKeyFormat(content)) {
                        setError('');
                    } else {
                        setError(formatError);
                    }
                };
                reader.readAsText(newFile);
            }
        } else {
            setError('');
            onChange?.('');
        }
        setFile(newFile);
    };

    return (
        <FormControl
            {...{
                title,
                required,
                error: !!(error || errorMessage),
                message: error || errorMessage,
                highlightError,
                dataAid,
                tooltip: fieldNameTooltip,
            }}
        >
            <div>
                <FileUpload
                    file={file}
                    accept='.pem'
                    onChange={handleFileChange}
                    selectFileText={selectFileText}
                />
            </div>
        </FormControl>
    );
};

export default memo(KeyReader);
