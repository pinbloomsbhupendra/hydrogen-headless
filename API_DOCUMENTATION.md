# ProLock Hydrogen App API Documentation
This document outlines all external APIs used in the ProLock Hydrogen Storefront. It is structured so you can easily recreate these requests in Postman or test them directly.

---

## 1. Shopify Storefront API (GraphQL)
Used for e-commerce logic: Cart, Checkout, and Customer Accounts.

**Base Details:**
*   **Method:** `POST`
*   **URL:** `https://iqwxvr-b0.myshopify.com/api/2024-01/graphql.json`
*   **Headers:**
    *   `Content-Type: application/json`
    *   `X-Shopify-Storefront-Access-Token: {{YOUR_PUBLIC_STOREFRONT_TOKEN}}`

### 1.1 Cart & Checkout
**Mutation: Add Lines to Cart (`CART_LINES_ADD`)**
Creates or adds an item to a user's cart and generates the checkout URL.
```graphql
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      checkoutUrl
      totalQuantity
    }
  }
}
```

**Mutation: Update Cart Line Quantity (`CART_LINES_UPDATE`)**
Updates the quantity of a specific item already in the cart.
```graphql
mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart {
      id
      totalQuantity
    }
  }
}
```

**Mutation: Remove Item from Cart (`CART_LINES_REMOVE`)**
Deletes an item entirely from the cart.
```graphql
mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
      id
      totalQuantity
    }
  }
}
```

**Checkout & Payment (Hosted URL)**
In headless Shopify builds, payments are processed on Shopify's secure hosted checkout servers. You do not hit an API endpoint with credit card details directly.
*   **Action:** Redirect the user to the `checkoutUrl` returned by the Cart mutations, or fetch it using the query below.
*   **How to Test:** Copy the `checkoutUrl` value returned and paste it into your browser. This will load the standard Shopify payment portal.

**Query: Get Cart Checkout URL**
If you already have a Cart ID, you can fetch its details (including the `checkoutUrl`) before sending the user to pay.
```graphql
query Cart($cartId: ID!) {
  cart(id: $cartId) {
    id
    checkoutUrl
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
  }
}
```
*Variables:*
```json
{
  "cartId": "gid://shopify/Cart/YOUR_CART_ID"
}
```

### 1.2 Customer Accounts (Signup & Login)

**Mutation: Create Customer Account (Signup)**
Registers a new customer in Shopify.
```graphql
mutation customerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer {
      id
      firstName
      lastName
      email
    }
    customerUserErrors {
      code
      field
      message
    }
  }
}
```
*Variables:* 
```json
{
  "input": {
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Mutation: Create Access Token (Login)**
Authenticates a user via email/password and returns a token used for authorized requests.
```graphql
mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
  customerAccessTokenCreate(input: $input) {
    customerAccessToken {
      accessToken
    }
    customerUserErrors {
      message
    }
  }
}
```
*Variables:*
```json
{
  "input": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

**Query: Get Customer Details**
Fetches profile info (Name, Email, Phone) using the access token.
```graphql
query Customer($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    id
    firstName
    lastName
    email
    phone
  }
}
```

### 1.3 Orders (Verification)
**Query: Verify Order (`CUSTOMER_ORDERS_QUERY`)**
Used to prove the user bought the item before registering a warranty.
```graphql
query CustomerOrders($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    orders(first: 50) {
      nodes {
        originalTotalPrice {
          amount
        }
        lineItems(first: 10) {
          nodes {
            title
          }
        }
      }
    }
  }
}
```

---

## 2. HubSpot API (REST)
Used exclusively as the CRM and Warranty Database backend.

**Base Details:**
*   **Headers:**
    *   `Content-Type: application/json`
    *   `Authorization: Bearer {{HUBSPOT_PRIVATE_ACCESS_KEY}}`

### 2.1 Warranty Form Submission (V2)
Pushes the collected Warranty details directly into the specific HubSpot Form.

*   **Method:** `POST`
*   **URL:** `https://api.hubapi.com/forms/v2/submissions/json-v2/245100011/160edfd8-7905-4eaf-807d-fc794121ff46`
*   **Body (JSON):**
```json
{
  "fields": [
    { "name": "email", "value": "test@example.com" },
    { "name": "firstname", "value": "John" },
    { "name": "serial_number", "value": "PROLOCK123" }
  ]
}
```

### 2.2 Contact Management (V3)
**Lookup Contact by Email**
*   **Method:** `GET`
*   **URL:** `https://api.hubapi.com/crm/v3/objects/contacts/test@example.com?idProperty=email`

**Create Contact**
*   **Method:** `POST`
*   **URL:** `https://api.hubapi.com/crm/v3/objects/contacts`
*   **Body (JSON):**
```json
{
  "properties": {
    "email": "newuser@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

### 2.3 Object Association (Linking Warranty to User)
Links a created Warranty Record to the Customer.

*   **Method:** `PUT`
*   **URL:** `https://api.hubapi.com/crm/v3/objects/contacts/{CONTACT_ID}/associations/deals/{DEAL_ID}/{ASSOCIATION_TYPE_ID}`

### 2.4 User Dashboard (Warranty History)
Fetches all historical warranty form submissions from HubSpot for a specific user.

*   **Method:** `GET`
*   **URL:** `https://api.hubapi.com/form-integrations/v1/submissions/forms/160edfd8-7905-4eaf-807d-fc794121ff46`
