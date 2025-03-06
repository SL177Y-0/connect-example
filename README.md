# App Connect Example

This project is an example showing how your application can connect a user to their Verida Vault and grant your application access to user data and other AI related APIs.

## Getting Started

Install dependencies and start server:

```sh
yarn
yarn start
```

Once the server is started, it should open `http://localhost:8080/` in your web browser.

You can then select the scopes you wish to access and click the `Connect Verida` button to be redirected to grant consent to your local application. Once you consent, an auth token is returned to your application and an example API request is made.

## Connection flow

The connection flow is as follows:

1. Generate an authentication request URL that includes the requested `scopes` and `redirectUrl` (your application page that handles a successful authentication request)
2. Redirect the user to the authentication request URL
3. If the user grants access, they are returned to your application with `auth_roken` in the query parameters
4. Save the `auth_token` in the local browser or your own database against the user account
5. Make API requests to the Verida API's setting the `Authorization` header to `Bearer ${authToken}`

## Code examples

See the [buildConnectUrl()](https://github.com/verida/app-connect-example/blob/main/src/main.ts#L21) for an example of building a connect URL that has an array of requested `scopes` and a `redirectUrl` that returns to your application once the auth token is generated.

See [main.ts](https://github.com/verida/app-connect-example/blob/main/src/main.ts#L120) for an example of making an API request with the returned API key:

```ts
$.get({
    url: `${API_ENDPOINT}/search/universal?keywords=meeting+agenda`,
    headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json"
    },
    success: (response) => {
        console.log(response)
        // ...
    }
})
```

It's possible to obtain a list of scopes from the `/auth/scopes` endpoint:

```ts
$.get({
    url: `${API_ENDPOINT}/auth/scopes`,
    success: (response) => {
        console.log(response)
        // ...
    }
})
```