/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as CustomerAccountAPI from '@shopify/hydrogen/customer-account-api-types';

export type CustomerDashboardQueryVariables = CustomerAccountAPI.Exact<{
  [key: string]: never;
}>;

export type CustomerDashboardQuery = {
  customer: Pick<
    CustomerAccountAPI.Customer,
    'id' | 'firstName' | 'lastName'
  > & {
    emailAddress?: CustomerAccountAPI.Maybe<
      Pick<CustomerAccountAPI.CustomerEmailAddress, 'emailAddress'>
    >;
  };
};

export type AccountCustomerDetailsQueryVariables = CustomerAccountAPI.Exact<{
  [key: string]: never;
}>;

export type AccountCustomerDetailsQuery = {
  customer: Pick<
    CustomerAccountAPI.Customer,
    'id' | 'firstName' | 'lastName'
  > & {
    emailAddress?: CustomerAccountAPI.Maybe<
      Pick<CustomerAccountAPI.CustomerEmailAddress, 'emailAddress'>
    >;
    phoneNumber?: CustomerAccountAPI.Maybe<
      Pick<CustomerAccountAPI.CustomerPhoneNumber, 'phoneNumber'>
    >;
    defaultAddress?: CustomerAccountAPI.Maybe<
      Pick<
        CustomerAccountAPI.CustomerAddress,
        'address1' | 'address2' | 'city' | 'province' | 'zip' | 'country'
      >
    >;
  };
};

export type CompleteProfileCustomerDetailsQueryVariables =
  CustomerAccountAPI.Exact<{[key: string]: never}>;

export type CompleteProfileCustomerDetailsQuery = {
  customer: Pick<
    CustomerAccountAPI.Customer,
    'id' | 'firstName' | 'lastName'
  > & {
    phoneNumber?: CustomerAccountAPI.Maybe<
      Pick<CustomerAccountAPI.CustomerPhoneNumber, 'phoneNumber'>
    >;
    defaultAddress?: CustomerAccountAPI.Maybe<
      Pick<
        CustomerAccountAPI.CustomerAddress,
        'address1' | 'city' | 'province' | 'zip' | 'country'
      >
    >;
  };
};

interface GeneratedQueryTypes {
  '#graphql\n  query CustomerDashboard {\n    customer {\n      id\n      firstName\n      lastName\n      emailAddress {\n        emailAddress\n      }\n    }\n  }\n': {
    return: CustomerDashboardQuery;
    variables: CustomerDashboardQueryVariables;
  };
  '#graphql\n  query AccountCustomerDetails {\n    customer {\n      id\n      firstName\n      lastName\n      emailAddress {\n        emailAddress\n      }\n      phoneNumber {\n        phoneNumber\n      }\n      defaultAddress {\n        address1\n        address2\n        city\n        province\n        zip\n        country\n      }\n    }\n  }\n': {
    return: AccountCustomerDetailsQuery;
    variables: AccountCustomerDetailsQueryVariables;
  };
  '#graphql\n    query CompleteProfileCustomerDetails {\n      customer {\n        id\n        firstName\n        lastName\n        phoneNumber {\n          phoneNumber\n        }\n        defaultAddress {\n          address1\n          city\n          province\n          zip\n          country\n        }\n      }\n    }\n  ': {
    return: CompleteProfileCustomerDetailsQuery;
    variables: CompleteProfileCustomerDetailsQueryVariables;
  };
}

interface GeneratedMutationTypes {}

declare module '@shopify/hydrogen' {
  interface CustomerAccountQueries extends GeneratedQueryTypes {}
  interface CustomerAccountMutations extends GeneratedMutationTypes {}
}
