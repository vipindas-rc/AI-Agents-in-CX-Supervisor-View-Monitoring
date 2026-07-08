import type { IRole, IUser } from '../types';

const roles: IRole[] = [
    {
        roleType: 'SUPER_USER',
        description: 'Authenticated Super User',
    },
    {
        roleType: 'MANAGE_USERS',
        description: 'Ability to Manage Users',
    },
    { roleType: 'USER', description: 'Authenticated User' },
    {
        roleType: 'ACCESS_SIBLINGS',
        description: 'Ability to Manage Sibling Users',
    },
    {
        roleType: 'ASSUME_USERS',
        description: 'Ability to assume users in hierachy',
    },
    {
        roleType: 'ACCESS_AUDIT_LOG',
        description: 'Ability to view the Audit Log',
    },
    {
        roleType: 'MANAGE_RIGHTS',
        description: 'Ability to Manage User Rights',
    },
];

export const user: IUser = {
    id: 38112,
    fullName: 'Test SU User',
    firstName: 'Test SU',
    lastName: 'User',
    email: 'test.user@nordigy.ru',
    rcUserId: undefined,
    roles,
    sso: true,
};
