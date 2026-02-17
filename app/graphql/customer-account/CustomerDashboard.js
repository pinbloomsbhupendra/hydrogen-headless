export const CUSTOMER_DASHBOARD_QUERY = `#graphql
  query CustomerDashboard {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;
