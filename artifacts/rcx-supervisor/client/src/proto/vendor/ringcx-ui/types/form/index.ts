import type {
    ControllerProps,
    ControllerRenderProps,
    FieldPath,
    FieldValues,
} from 'react-hook-form';

type OriginalParams = Parameters<ControllerProps['render']>[0];

type OriginalReturn = ReturnType<ControllerProps['render']>;

type GenericParams<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<OriginalParams, 'field'> & {
    field: ControllerRenderProps<TFieldValues, TName>;
};

export type RHFControllerRender = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    props: GenericParams<TFieldValues, TName>
) => OriginalReturn;

export type RHFControllerRenderWithContent = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    props: GenericParams<TFieldValues, TName> & {
        content?: string;
    }
) => OriginalReturn;
