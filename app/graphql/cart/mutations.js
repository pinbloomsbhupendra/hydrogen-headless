import { CART_QUERY_FRAGMENT } from './queries';

export const CART_CREATE = `#graphql
  mutation CartCreate($input: CartInput!, $numCartLines: Int = 100) {
    cartCreate(input: $input) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        message
        field
      }
    }
  }
  ${CART_QUERY_FRAGMENT}
`;

export const CART_LINES_ADD = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $numCartLines: Int = 100) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        message
        field
      }
    }
  }
  ${CART_QUERY_FRAGMENT}
`;

export const CART_LINES_UPDATE = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $numCartLines: Int = 100) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        message
        field
      }
    }
  }
  ${CART_QUERY_FRAGMENT}
`;

export const CART_LINES_REMOVE = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $numCartLines: Int = 100) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        message
        field
      }
    }
  }
  ${CART_QUERY_FRAGMENT}
`;
