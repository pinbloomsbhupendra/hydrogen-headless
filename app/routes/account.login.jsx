export async function loader({context}) {
  const response = await context.customerAccount.login();

  response.headers.append(
    'Set-Cookie',
    await context.session.commit(),
  );

  return response;
}
