import { gql } from 'graphql-tag';
export { submitToHubSpot } from './mutations.js';

export const hubspotTypeDefs = gql`
  type HubSpotFormSubmission {
    success: Boolean!
    message: String
  }

  type HubSpotContact {
    id: String
    email: String
    properties: String
  }

  extend type Mutation {
    submitHubSpotForm(
      formId: String!
      fields: String!
      pageUri: String
      pageName: String
      skipHubSpot: Boolean
    ): HubSpotFormSubmission

    syncContactToHubSpot(
      email: String!
      firstName: String
      lastName: String
      phone: String
      company: String
      properties: String
    ): HubSpotContact
  }

  extend type Query {
    checkSerialRegistration(serial: String!): Boolean
  }
`;

export const SUBMIT_HUBSPOT_FORM_MUTATION = `#graphql
  mutation SubmitHubSpotForm(
    $formId: String!,
    $fields: String!,
    $pageUri: String,
    $pageName: String,
    $skipHubSpot: Boolean
  ) {
    submitHubSpotForm(
      formId: $formId,
      fields: $fields,
      pageUri: $pageUri,
      pageName: $pageName,
      skipHubSpot: $skipHubSpot
    ) {
      success
      message
    }
  }
`;

export const SYNC_CONTACT_TO_HUBSPOT_MUTATION = `#graphql
  mutation SyncContactToHubSpot(
    $email: String!,
    $firstName: String,
    $lastName: String,
    $phone: String,
    $company: String,
    $properties: String
  ) {
    syncContactToHubSpot(
      email: $email,
      firstName: $firstName,
      lastName: $lastName,
      phone: $phone,
      company: $company,
      properties: $properties
    ) {
      id
      email
      properties
    }
  }
`;
