export const PRODUCTS_QUERY = `#graphql
query {
  products(first: 5) {
    nodes {
      id
      title
      handle
    }
  }
}`;
