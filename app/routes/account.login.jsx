export async function loader({context}) {
  // Start Shopify Customer Account OAuth login flow
  return context.customerAccount.login();
}
