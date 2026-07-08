/** Type expressing an immutable reference to some value. FlatRef folds on
 * instance-constructor level, meaning, for each A, constructor accepts
 * FlatRef<A>, producing a *different* reference to the *same* object. It makes
 * FlatRef a good way to do things that mutate *internally*, notifying the
 * runtime of changes in a controlled manner by changing *external* address. */
export class FlatRef<A> {
    private value: A;

    constructor(ref: FlatRef<A>);
    constructor(value: A);
    constructor(valueOrRef: A | FlatRef<A>) {
        this.value =
            valueOrRef instanceof FlatRef ? valueOrRef.deref : valueOrRef;
    }

    get deref() {
        return this.value;
    }
}
