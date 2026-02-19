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

export const PRODUCT_DETAILS_QUERY = `#graphql
  query ProductDetails($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        nodes {
          url
          altText
          width
          height
        }
      }
      variants(first: 10) {
        nodes {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;
