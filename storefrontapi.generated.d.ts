/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type ProductQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'>
  >;
};

export type ProductImageQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
}>;

export type ProductImageQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'title'> & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText'>
        >;
      }
    >;
  };
};

export type ProductDetailsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ProductDetailsQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'title' | 'descriptionHtml'> & {
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      images: {
        nodes: Array<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
      };
      variants: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }
        >;
      };
    }
  >;
};

interface GeneratedQueryTypes {
  '#graphql\n  query Product($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n    }\n  }\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  query ProductImage($query: String!) {\n    products(first: 1, query: $query) {\n      nodes {\n        title\n        featuredImage {\n          url\n          altText\n        }\n      }\n    }\n  }\n': {
    return: ProductImageQuery;
    variables: ProductImageQueryVariables;
  };
  '#graphql\n  query ProductDetails($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      descriptionHtml\n      priceRange {\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      images(first: 5) {\n        nodes {\n          url\n          altText\n          width\n          height\n        }\n      }\n      variants(first: 10) {\n        nodes {\n          id\n          availableForSale\n          price {\n            amount\n            currencyCode\n          }\n        }\n      }\n    }\n  }\n': {
    return: ProductDetailsQuery;
    variables: ProductDetailsQueryVariables;
  };
}

interface GeneratedMutationTypes {}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
