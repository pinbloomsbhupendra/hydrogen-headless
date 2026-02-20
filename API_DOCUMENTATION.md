# API Documentation

This document outlines the various APIs used in the **Hydrogen Headless** project, including Shopify (Storefront & Admin), HubSpot (CRM & Forms), and internal application routes.

 All tokens and domains below are specific to the production/development environment of **Prolock / Hydrogen Headless**.

## 1. HubSpot CRM API (Testing with Postman)

### 1.1 Create/Update Contact
**Endpoint:** `POST https://api.hubapi.com/crm/v3/objects/contacts`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer YOUR_HUBSPOT_TOKEN_HERE
```

**Request Body (JSON):**
```json
{
 "properties": {
   "email": "hmauryooa454@gmail.com",
   "firstname": "Hemant",
   "lastname": "Maurya",
   "phone": "7255990852",
   "address": "Patna, Bihar",
   "city": "Patna",
   "state": "Bihar",
   "zip": "800001",
   "country": "India",
   "serial_number": "PRO12345"
 }
}
```

### 1.2 Get Contact Details
**Endpoint:** `GET https://api.hubapi.com/crm/v3/objects/contacts/{email}?idProperty=email&properties={comma_separated_properties}`

**Example URL:**
`https://api.hubapi.com/crm/v3/objects/contacts/roeehitraj@gmail.com?idProperty=email&properties=email,firstname,lastname,warranty_number`

**Headers:**
```http
Authorization: Bearer YOUR_HUBSPOT_TOKEN_HERE
```

### 1.3 Create Warranty Object (Custom)
**Endpoint:** `POST https://api.hubapi.com/crm/v3/objects/p245100011_warranty_registrations`

**Headers:**
```http
Authorization: Bearer YOUR_HUBSPOT_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "properties": {
    "warranty_number": 123456,
    "serial_number": "PRO123",
    "product_name": "ProLock",
    "model_type": "Standard",
    "order_id": "#1001",
    "phone": "555-0123"
  }
}
```

---

## 2. Shopify Storefront API (Testing with Postman)

> **⚠️ CRITICAL POSTMAN SETTING:**
> Ensure the **Authorization** tab is set to **"No Auth"**.
> The API token is passed in the **Headers**. If you have an active "Authorization" header (e.g. left over from HubSpot), Shopify will return a `400 Bad Request` error.

## 2. Shopify Storefront API

> **⚠️ CRITICAL POSTMAN SETTING:**
> Ensure the **Authorization** tab is set to **"No Auth"**. Conflicting headers will cause a `400 Bad Request`.

### 1️⃣ Customer Signup
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/api/2024-10/graphql.json`

**Headers**
- `Content-Type`: `application/json`
- `Shopify-Storefront-Private-Token`: `YOUR_STOREFRONT_PRIVATE_TOKEN_HERE`

**GraphQL Mutation**
```graphql
mutation customerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer {
      id
      email
    }
    customerUserErrors {
      message
    }
  }
}
```

**Variables**
```json
{
  "input": {
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "firstName": "John",
    "lastName": "Doe",
    "acceptsMarketing": false
  }
}
```

### 2️⃣ Customer Login (Generate Access Token)
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/api/2024-10/graphql.json`

**Headers**
- `Content-Type`: `application/json`
- `Shopify-Storefront-Private-Token`: `YOUR_STOREFRONT_PRIVATE_TOKEN_HERE`

**GraphQL Mutation**
```graphql
mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
  customerAccessTokenCreate(input: $input) {
    customerAccessToken {
      accessToken
      expiresAt
    }
    customerUserErrors {
      field
      message
    }
  }
}
```

**Variables**
```json
{
  "input": {
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }
}
```

### 3️⃣ Create Cart
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/api/2024-10/graphql.json`

**Headers**
- `Content-Type`: `application/json`
- `Shopify-Storefront-Private-Token`: `YOUR_STOREFRONT_PRIVATE_TOKEN_HERE`

**GraphQL Mutation**
```graphql
mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      lines(first: 5) {
        nodes {
          id
          quantity
        }
      }
    }
  }
}
```

**Variables**
```json
{
  "input": {
    "lines": [
      {
        "merchandiseId": "gid://shopify/ProductVariant/47372375523586",
        "quantity": 1
      }
    ]
  }
}
```

### 4️⃣ Add to Cart
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/api/2024-10/graphql.json`

**Headers**
- `Content-Type`: `application/json`
- `Shopify-Storefront-Private-Token`: `YOUR_STOREFRONT_PRIVATE_TOKEN_HERE`

**GraphQL Mutation**
```graphql
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      totalQuantity
    }
  }
}
```

**Variables**
```json
{
  "cartId": "gid://shopify/Cart/hWN8zdQyDibjFiKOw3jP1hZs?key=de686eb944c4dda634b9ad80c23bd422",
  "lines": [
    {
      "merchandiseId": "gid://shopify/ProductVariant/47372375523586",
      "quantity": 2
    }
  ]
}
```

---

### 5️⃣ Get Product Details
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/api/2024-10/graphql.json`

**Headers**
- `Content-Type`: `application/json`
- `Shopify-Storefront-Private-Token`: `YOUR_STOREFRONT_PRIVATE_TOKEN_HERE`

**GraphQL Query**
```graphql
query getProduct($handle: String!) {
  product(handle: $handle) {
    id
    title
    description
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 5) {
      nodes {
        id
        title
      }
    }
  }
}
```

**Variables**
```json
{
  "handle": "prolock"
}
```

---

### 6️⃣ Retrieve Checkout URL
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/api/2024-10/graphql.json`

**Headers**
- `Content-Type`: `application/json`
- `Shopify-Storefront-Private-Token`: `YOUR_STOREFRONT_PRIVATE_TOKEN_HERE`

**GraphQL Query**
```graphql
query getCheckoutUrl($id: ID!) {
  cart(id: $id) {
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

**Variables**
```json
{
  "id": "gid://shopify/Cart/YOUR_CART_ID_HERE"
}
```

---

## 3. Shopify Admin API (Server-Side Only)

### 1️⃣ Verify Order (Serial Number Logic)
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/admin/api/2024-10/graphql.json`

**Headers**
- `Content-Type`: `application/json`
- `X-Shopify-Access-Token`: `YOUR_ADMIN_API_TOKEN_HERE`

**GraphQL Query**
```graphql
query verifyOrder($query: String!) {
  orders(first: 5, query: $query) {
    nodes {
      id
      name
      email
      createdAt
      tags
      customer {
        id
      }
      lineItems(first: 5) {
        nodes {
          title
          sku
          image {
            url
          }
        }
      }
    }
  }
}
```

**Variables**
```json
{
  "query": "email:customer@example.com AND name:#1001"
}
```

### 2️⃣ Check Warranty Status (Dashboard)
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/admin/api/2024-10/graphql.json`

**GraphQL Query**
```graphql
query getCustomerWarranty($id: ID!) {
  customer(id: $id) {
    metafield(namespace: "custom", key: "warranty_active") {
      value
    }
  }
}
```

**Variables**
```json
{
  "id": "gid://shopify/Customer/123456789"
}
```

### 3️⃣ Register Warranty (Set Metafield)
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/admin/api/2024-10/graphql.json`

**GraphQL Mutation**
```graphql
mutation setMetafield($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

**Variables**
```json
{
  "metafields": [
    {
      "ownerId": "gid://shopify/Customer/REPLACE_WITH_REAL_ID",
      "namespace": "custom",
      "key": "warranty_active",
      "type": "json",
      "value": "{\"warrantyNumber\":170923,\"serial\":\"PRO123\",\"status\":\"ACTIVE\"}"
    }
  ]
}
```

### 4️⃣ Register Warranty (Tag Order)
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/admin/api/2024-10/graphql.json`

**GraphQL Mutation**
```graphql
mutation tagOrder($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) {
    userErrors {
      message
    }
  }
}
```

**Variables**
```json
{
  "id": "gid://shopify/Order/REPLACE_WITH_REAL_ORDER_ID",
  "tags": ["Warranty Registered"]
}
```

---

### 4️⃣ Get Customer Details (Full)
**Endpoint**
`POST https://hydrogen-headless-2.myshopify.com/admin/api/2024-10/graphql.json`

**GraphQL Query**
```graphql
query getCustomerDetails($id: ID!) {
  customer(id: $id) {
    id
    firstName
    lastName
    email
    phone
    amountSpent {
      amount
      currencyCode
    }
    createdAt
    defaultAddress {
      address1
      city
      country
      zip
    }
    orders(first: 5, sortKey: CREATED_AT, reverse: true) {
      nodes {
        id
        name
        totalPriceSet {
          shopMoney {
            amount
          }
        }
        displayFinancialStatus
        displayFulfillmentStatus
      }
    }
    metafield(namespace: "custom", key: "warranty_active") {
      value
    }
  }
}
```

**Variables**
```json
{
  "id": "gid://shopify/Customer/9023984959746"
}
```

---

## 4. Internal Routes (Remix Actions)

These are the endpoints used by the frontend forms. They accept `multipart/form-data` or `application/x-www-form-urlencoded`.

**Local Domain:** `http://localhost:3000`
**Production Domain:** `https://hydrogen-headless-2.myshopify.com` (Check your actual deployment URL if different)

| Route | URL | Method | Payload Keys |
| :--- | :--- | :--- | :--- |
| **Login** | `/account/login` | `POST` | `intent="login"`, `email`, `password` |
| **Signup** | `/account/login` | `POST` | `intent="signup"`, `email`, `password`, `firstName`, `lastName` |
| **Add to Cart** | `/buy-prolock` | `POST` | `variantId`, `quantity` |
| **Warranty Reg.**| `/register-warranty`| `POST` | `orderNumber`, `email`, `phone`, `firstName`, `lastName`, `serialNumber`... |
