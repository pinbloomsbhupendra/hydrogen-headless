export const PRODUCT_IMAGE_QUERY = `#graphql
  query ProductImage($query: String!) {
    products(first: 1, query: $query) {
      nodes {
        title
        featuredImage {
          url
          altText
        }
      }
    }
  }
`;
