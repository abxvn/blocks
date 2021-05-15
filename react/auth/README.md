@teku-blocks/react-auth
=====
[![@teku-blocks/react-auth version][npm-version-badge]][npm-url]
[![@teku-blocks/react-auth downloads per months][npm-downloads-badge]][npm-url]
[![Code style][code-style]][code-style-url]
[![Install size][code-install-size]][npm-url]

Simple solution to make your React web application authentication / authorization. Designed to work with [Auth0](https://auth0.com/docs/libraries/auth0js), [Firebase v8](https://firebase.google.com/support/release-notes/js) and  [Firebase v9](https://firebase.google.com/docs/web/modular-upgrade).

**Table of contents**
* [Installation](#installation)
* [Concept](#concept)
* [How To Use](#how-to-use)
  + [Handle auth with AuthProvider](#handle-auth-with-authprovider)
  + [Callbacks](#callbacks)
  + [Driver options](#driver-options)
  + [Access auth data with AuthContext](#access-auth-data-with-authcontext)
  + [Using Auth0 with Firebase](#using-auth0-with-firebase)
* [List of available driver ids](#list-of-available-driver-ids)
* [Contribution](#contribution)

## Installation

```shell
npm install --dev @teku-blocks/react-auth
```

## Concept

There are 3 supported auth drivers:
- **Auth0**: Using [auth0][auth0], or even in combination with Firebase Auth
- **FirebaseAuth**: Using Google [Firebase Auth][firebase-auth]
- **FireseProfile**: Fetching user profile from Google [Firestore][service-firestore]

After initialization, these [drivers](#driver-options) will automatically handle authentication / authorization logic for you, the resolved profiles will be pushed into [AuthContext](#access-auth-data-with-authcontext) through their [driver ids](#list-of-available-driver-ids) and even trigger [event handlers](#callbacks) for us.

## How To Use

### Handle auth with AuthProvider

We provide `AuthProvider` for wrapping your components / pages, which will automatically handle authentication process for you.

```jsx
import { AuthProvider } from '@teku-blocks/react-auth'

<AuthProvider {...options}>
  {children}
</AuthProvider>
```

There are 2 types of options:
  - [Callbacks](#callbacks)
  - [Driver options](#driver-options)

All of options are optional, but as least 1 driver options should be provided. Option syntaxes / signatures are described using Typescript style or detailed tables in following sections.

### Callbacks

**`onUserChanged`**

> (driver: [AuthDrivers](#list-of-available-driver-ids), user: [any][type-object] | null) => void

This callback is fired everytime auth data changed, when the users are logged in, or logged out (`null`).

The `driver` param are driver id (like auth0, firebase...) that has auth data updated.

**`onError`**

> (driver: [AuthDrivers](#list-of-available-driver-ids), err: [Error][type-error]) => void

This callback is only fired when error happens.

### Driver options

The driver options ([objects][type-object]) will be used to initialize authentication clients.

**`withAuth0`**

These are only options which is required or provided with default values. More auth0 options can be found at [Auth0 options][auth0-options]

| **Option**       | **Type**                | **Description**                                                                                                 | **Default**            |
|------------------|-------------------------|-----------------------------------------------------------------------------------------------------------------|------------------------|
| domain           | [string][type-string]   | `required` Domain registed with Auth0 [more info][auth0-basic]                                                  |                        |
| clientId         | [string][type-string]   | `required` Auth0 client id [more info][auth0-basic]                                                             |                        |
| redirectUri      | [string][type-string]   | `required` Callback after Auth0 authentication [more info][auth0-uris]                                          |                        |
| responseType     | [string][type-string]   | Response type                                                                                                   | `token id_token`       |
| scope            | [string][type-string]   | Scope                                                                                                           | `openid profile email` |


**Authenticated Auth0 profile contains these fields:**
- `_token`: auth token
- `_tokenExpiresAt`: token expiration timestamp
- `email`: user email
- `emailVerified`: where the user email has been verified
- `name`: user name
- `picture`: URL to user picture


**`withFirebaseAuth`**

These are options of Firebase auth driver:

| **Option**          | **Type**                                    | **Description**                                                                                                                      | **Default**                            |
|---------------------|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| auth                | [Auth][#firebase-auth]                      | `required` Firebase auth instance                                                                                                    |                                        |
| onAuthStateChanged  | (user: [any][type-object] or `null`) => void | `required` Callback whenever firebase auth user logged in / logged out (`null`)                                                      |                                        |
| customClaimMap      | [any][type-object]                          | Map fields from custom claims into solved user                                                                                       | `{}`                                   |
| customTokenMap      | [any][type-object]                          | Provide fields to be used during custom token exchanges when you combine firebase with auth0 [more info](#using-auth0-with-firebase) | `{ inputName: 't', outputName: 'ct' }` |
| getCustomToken           | (token: [string][type-string]) => Promise<[string][type-string]>             | Only required when you combine firebase with auth0, `async` function to resolve with custom token [more info](#using-auth0-with-firebase)                                           |                                        |
| withAuth0 | [boolean][type-boolean] | Whether should firebase combine with auth0  |  `true`                 |

**Authenticated FirebaseAuth profile contains these fields:**
- `_token`: auth token
- `uid`: user's uid
- `email`: user email
- `emailVerified`: where the user email has been verified
- `phoneNumber`: user associated phone number
- `name`: user name
- `custom` claim fields
- `picture`: URL to user picture

Apart from `_token`, `uid` and `picture`, other fields are standardized to be used as Firebase security rules [more info](https://firebase.google.com/docs/reference/rules/rules.firestore.Request#auth).

**`withFirebaseProfile`**

This driver requires `withFirebaseAuth` to be setup, it will **watch** for firebase auth data changed to determine when to fetch necessary profile, to login and logout.

| **Option**  | **Type**                                                                                                           | **Description**                                                                                                                                                                                    | **Default** |
|-------------|--------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| getQuery    | (conditions: [any][type-object]) => [Query][firestore-query]                                                     | `required` A function to return a [Firestore Query][firestore-query] for filter user profile, since we only take first found document, a query with `limit(1)` is recommended                      |             |
| getSnapshot | (query: [Query][firestore-query], onChange: [Function][type-function], onError: [Function][type-function]) => [Unsubscribe][firestore-unsubscribe] | `required` A function to start watching profiles query snapshot. Usually we will need to bind `onChange` and `onError` to snapshot creator. For example `query.onSnapshot(onChange, onError)` |         |
| userIdField | string                                                                                                             | User id field for adding into conditions                                                                                                                                                           | `uid`     |
| criteria    | [any][type-object]                                                                                                 | Additional criteria to filter profile data with firebase user id                                                                                                                                   |             |

### Access auth data with AuthContext

We profile a React hook to listen for auth data context changes

```jsx
import { useAuth } from '@teku-blocks/react-auth`

const auth = useAuth()
```

The `auth` context value presents authentication state of all available [drivers](#list-of-available-driver-ids):

> {[key in [AuthDrivers](#list-of-available-driver-ids)]}: [any][type-object]}

### Using Auth0 with Firebase

For combine Auth0 with Firebase, we need to setup a [cloud function](https://firebase.google.com/docs/functions) for using Firebase Admin SDK to create [custom tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens).

Here is an example of `getCustomToken` function:
```ts
const getCustomToken = async token => {
  const exchangeToken = firebase.functions().httpsCallable('auth')
  const { data } = exchangeToken({ t: token })

  return data.token
}
```

After auth0 done authenticated a user, if the user's email has been verified, `react-auth` will try to authenticate the user through custom tokens, hence allow the user to access firebase resources.

## List of available driver ids

The full list of supported driver ids can be found in `AuthDrivers` enum. You can use them to determine with part of auth data is being initalized

```ts
enum AuthDrivers {
  AUTH0 = 'auth0',
  FIREBASE_AUTH = 'firebase',
  FIREBASE_PROFILE = 'profile'
}
```

## Contribution

All contributions are welcome. Feel free to open PR or share your ideas of improvement.

Thank you.

[npm-url]: https://www.npmjs.com/package/@teku-blocks/react-auth
[npm-downloads-badge]: https://img.shields.io/npm/dw/@teku-blocks/react-auth
[npm-version-badge]: https://img.shields.io/npm/v/@teku-blocks/react-auth.svg
[code-style]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[code-style-url]: https://standardjs.com
[code-install-size]: https://packagephobia.com/badge?p=@teku-blocks/react-auth

[type-error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[type-object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[type-string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[type-boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
[type-function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions

[auth0-basic]: https://auth0.com/docs/get-started/dashboard/application-settings#basic-information
[auth0-uris]: https://auth0.com/docs/get-started/dashboard/application-settings#application-uris
[auth0-options]: https://auth0.com/docs/libraries/auth0js#available-parameters

[firebase-auth]: https://firebase.google.com/docs/reference/js/firebase.auth
[firebase-functions]: https://firebase.google.com/docs/reference/js/firebase.functions
[firestore-query]: https://firebase.google.com/docs/reference/js/firebase.firestore.Query
[firestore-unsubscribe]: https://firebase.google.com/docs/reference/js/v9/firestore_.unsubscribe

[firestore]: https://firebase.google.com/docs/firestore
[auth0]: https://auth0.com/
