import type { BaseSyntheticEvent } from 'react';

import type {
    BrowserNativeObject,
    FieldErrors,
    FieldPath,
    FieldValues,
    FormState,
    NestedValue,
    UseFormProps,
    UseFormReturn,
} from 'react-hook-form';
import type * as Yup from 'yup';

import type { INDETERMINATE_FIELD_VALUE } from '../../constants';

export type Fields<T extends FieldValues> = Array<FieldPath<T>>;

// This is unwrapped DeepPartial with custom value type
export type DefaultValues<T extends FieldValues> = T extends
    | BrowserNativeObject
    | NestedValue
    ? T
    : {
          [K in keyof T]?:
              | DefaultValues<T[K]>
              | undefined
              | typeof INDETERMINATE_FIELD_VALUE;
      };

export type DirtyFields<T extends FieldValues> = FormState<T>['dirtyFields'];

export type GID = symbol;

export type OnSaveArgs<T extends FieldValues> = {
    values?: T;
    dirtyFields?: FormState<T>['dirtyFields'];
    trigger?: UseFormReturn<T>['trigger'];
};

export type OnSaveCallback<T extends FieldValues> = (
    args?: OnSaveArgs<T>
) => Promise<void | string>;

export type OnErrorCallback<T extends FieldValues> = (
    errors: FieldErrors<T>,
    event?: BaseSyntheticEvent
) => unknown | Promise<unknown>;

export type GroupRaw<T extends FieldValues> = {
    fields: Fields<T>;
    validationScheme?: Yup.AnyObjectSchema;
    onSave?: OnSaveCallback<T>;
};

export type Group<T extends FieldValues> = GroupRaw<T> & {
    // formState's filtered maps
    defaultValues: DefaultValues<T>;
    touchedFields: FormState<T>['touchedFields'];
    dirtyFields: FormState<T>['dirtyFields'];
    errors: FormState<T>['errors'];

    // based on dirtyFields
    isDirty: boolean;
};

export type GroupRawState<T extends FieldValues> = Record<GID, GroupRaw<T>>;
export type GroupState<T extends FieldValues> = Record<GID, Group<T>>;

export type SetGroupMethod<T extends FieldValues> = (
    options: GroupRaw<T> & {
        id: GID;
    }
) => void;

export type GetGroupMethod<T extends FieldValues> = (
    id: GID
) => Group<T> | null;

export type SetDefaultValuesMethod<T extends FieldValues> = (
    defaultValues: DefaultValues<T>
) => void;

export type UseConfigFormOptions<T extends FieldValues> = {
    validationScheme?: Yup.AnyObjectSchema;
    defaultValues?: UseFormProps<T>['defaultValues'];
};

export type UseConfigFormReturn<T extends FieldValues> = UseFormReturn<T> & {
    groupsState: GroupState<T>;
    setGroup: SetGroupMethod<T>;
    getGroup: GetGroupMethod<T>;
    setDefaultValues: SetDefaultValuesMethod<T>;
};

export type UseConfigFormGroupProps<T extends FieldValues> = GroupRaw<T> & {
    id: GID;
    defaultValues?: DefaultValues<T>;
};

export type UseConfigFormTempState<T extends FieldValues> = {
    groupState: GroupState<T>;
    groups: GroupRawState<T>;
    defaultValues: FormState<T>['defaultValues'];
    touchedFields: FormState<T>['touchedFields'];
    dirtyFields: FormState<T>['dirtyFields'];
    errors: FormState<T>['errors'];
};
