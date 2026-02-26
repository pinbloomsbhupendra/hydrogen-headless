import { CART_QUERY_FRAGMENT } from './queries';

export const CART_CREATE = `#graphql
  mutation cartCreate($input: CartInput!, $numCartLines: Int = 100) {
    cartCreate(input: $input) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_QUERY_FRAGMENT}
`;

export const CART_LINES_ADD = `#graphql
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $numCartLines: Int = 100) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_QUERY_FRAGMENT}
`;

export const CART_LINES_UPDATE = `#graphql
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $numCartLines: Int = 100) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_QUERY_FRAGMENT}
`;

export const CART_LINES_REMOVE = `#graphql
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $numCartLines: Int = 100) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_QUERY_FRAGMENT}
`;
