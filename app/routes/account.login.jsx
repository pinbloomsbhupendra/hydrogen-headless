export async function loader({context}) {
  // Start Shopify Customer Account OAuth login
  return context.customerAccount.login();
}
