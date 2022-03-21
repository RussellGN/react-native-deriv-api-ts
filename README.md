# deriv-api-ts

A typescript wrapper around [Deriv API](https://github.com/binary-com/deriv-api).

# Installation

```shell
yarn add deriv-api-ts
```

# Usage

## Endpoints without authentication

```typescript
import DerivAPI from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPI(appId);
const websiteStatus = await api.websiteStatus();

console.log(websiteStatus);

// You will have intellisense on the return types...
console.log(websiteStatus.api_call_limits.max_requests_outcome.hourly);
```

## Endpoints with authentication

You can authenticate whenever you want by calling `authorize` function. When you call an endpoint that needs
authentication (e.g. `profitTable`), it will first check if the session is already authenticated. If not, it will try to
authenticate with the token that is passed either to the constructor or to the last call of `authorize` function. If no
token is found, an error will be thrown.

```typescript
import DerivAPI from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPI(appId);

const authResult = await api.authorize('YOUR API TOKEN');
```

OR

```typescript
import DerivAPI from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPI(1234, 'YOUR API TOKEN');
```

## Types

```typescript
import DerivAPI, { Exception } from 'deriv-api-ts';
import type { ProfitTable } from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPI(1234, 'YOUR API TOKEN');

api.profitTable()
   .then((profitTableResult: ProfitTable) =>
   {
	   // Your code
   })
   .catch((err: Exception) =>
   {
	   console.log(`Code: ${ errObj.code } Message: ${ errObj.message }`);
   })
   // Closing the websocket connection gracefully.
   .finally(() => api.disconnect());
```

## Error Handling

```typescript
import DerivAPI, { Exception } from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPI(1234, 'YOUR API TOKEN');

api.profitTable()
   .then((profitTableResult) =>
   {
	   // Your code
   })
   .catch((err: Exception) =>
   {
	   console.log(`Code: ${ errObj.code } Message: ${ errObj.message }`);
   })
	// Closing the websocket connection gracefully.
   .finally(() => api.disconnect());
```

OR

```typescript
import DerivAPI, { Exception } from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPI(1234, 'YOUR API TOKEN');

try
{
	const profitTableResult = await api.profitTable();
}
catch (err)
{
	const errObj = err as Exception;
	console.log(`Code: ${ errObj.code } Message: ${ errObj.message }`);
}
finally
{
	// Closing the websocket connection gracefully.
	api.disconnect();
}
```
