/* PROTOTYPE STUB — replaces the AngularJS directive registration.
 * In standalone mode we render the React component directly (via its named
 * export), so this just returns the component and never touches angular. */
const CreateAngularModule = (
  _name: string,
  Component: any,
  ..._rest: unknown[]
) => Component;

export default CreateAngularModule;
