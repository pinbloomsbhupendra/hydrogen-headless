export const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation customerUpdate($customer: CustomerUpdateInput!) {
    customerUpdate(customer: $customer) {
      customer {
        firstName
        lastName
        phoneNumber {
          phoneNumber
        }
        emailAddress {
          emailAddress
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
