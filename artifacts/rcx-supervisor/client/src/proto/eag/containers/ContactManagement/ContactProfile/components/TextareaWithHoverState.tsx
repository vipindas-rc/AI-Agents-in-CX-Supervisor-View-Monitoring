import {
    useState,
    type ChangeEventHandler,
    type ChangeEvent,
    type KeyboardEvent,
} from 'react';

import { Textarea } from '@ringcentral/spring-ui';
import { isEscapeKey } from '@ringcx/ui';

import { HoverableStateContainer } from './HoverableStateContainer';

type TextareaWithHoverStateProps = {
    value: string;
    label: string;
    onChange: ChangeEventHandler<HTMLTextAreaElement> &
        ChangeEventHandler<HTMLInputElement>;
    onSubmit?: () => void;
};

export const TextareaWithHoverState = (props: TextareaWithHoverStateProps) => {
    const { value, label, onChange, onSubmit } = props;
    const [editState, setEditState] = useState(false);
    const [originalValue, setOriginalValue] = useState(value);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (isEscapeKey(e.key)) {
            e.preventDefault();
            onChange({
                target: { value: originalValue },
            } as ChangeEvent<HTMLTextAreaElement>);
            setEditState(false);
        }
    };

    const handleEditClick = () => {
        setOriginalValue(value);
        setEditState(true);
    };

    if (editState) {
        return (
            <div className='w-9/12'>
                <Textarea
                    value={value}
                    maxRows={4}
                    minRows={1}
                    type='text'
                    variant='outlined'
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setEditState(false);
                        onSubmit?.();
                    }}
                    autoFocus
                    fullWidth
                    clearBtn={false}
                    inputProps={{
                        'aria-label': label,
                    }}
                />
            </div>
        );
    }

    const renderContent = () => (
        <div className='max-h-25 my-1.5 line-clamp-3 w-full whitespace-normal break-words'>
            {value || '-'}
        </div>
    );

    return (
        <HoverableStateContainer
            renderContent={renderContent}
            onClickEditButton={handleEditClick}
        />
    );
};
