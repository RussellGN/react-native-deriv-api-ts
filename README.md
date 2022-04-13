# deriv-api-ts

A typescript wrapper around [Deriv API](https://github.com/binary-com/deriv-api).

# Installation

## Yarn
```shell
yarn add deriv-api-ts
```

## NPM
```shell
npm install deriv-api-ts
```

# Usage

## Endpoints without authentication

```typescript
import { DerivAPIWrapper } from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPIWrapper(appId);
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
import { DerivAPIWrapper } from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPIWrapper(appId);

const authResult = await api.authorize('YOUR API TOKEN');
```

OR

```typescript
import { DerivAPIWrapper } from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPIWrapper(appId, 'YOUR API TOKEN');
```

## Types
`@deriv/api-types` package is used internally to provide support for types.

```typescript
import { DerivAPIWrapper, Exception, Types as binaryTypes } from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPIWrapper(appId, 'YOUR API TOKEN');
const params: binaryTypes.ProfitTableRequest = {
    contract_type : [ 'CALL' ],
    profit_table  : 1,
};

api.profitTable(params)
   .then((profitTableResult: binaryTypes.ProfitTable) =>
   {
       // Your code
   })
   .catch((err: Exception) =>
   {
	   console.log(`Code: ${ errObj.code } Message: ${ errObj.message } Details: ${ JSON.stringify(errObj.getParams()) }`);
   })
   // Closing the websocket connection gracefully.
   .finally(() => api.disconnect());
```

## Error Handling

```typescript
import { DerivAPIWrapper, Exception, Types } from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPIWrapper(1234, 'YOUR API TOKEN');
const params: Types.ProfitTableRequest = {
    contract_type : [],
    profit_table  : 1,
};

api.profitTable(params)
   .then((profitTableResult) =>
   {
       // Your code
   })
   .catch((err: Exception) =>
   {
	   console.log(`Code: ${ errObj.code } Message: ${ errObj.message } Details: ${ JSON.stringify(errObj.getParams()) }`);
   })
    // Closing the websocket connection gracefully.
   .finally(() => api.disconnect());
```

OR

```typescript
import { DerivAPIWrapper, Exception, Types } from 'deriv-api-ts';

const appId = 1234;
const api = new DerivAPIWrapper(1234, 'YOUR API TOKEN');
const params: Types.ProfitTableRequest = {
    contract_type : [],
    profit_table  : 1,
};

try
{
    const profitTableResult = await api.profitTable(params);
}
catch (err)
{
    const errObj = err as Exception;
    console.log(`Code: ${ errObj.code } Message: ${ errObj.message } Details: ${ JSON.stringify(errObj.getParams()) }`);
}
finally
{
    // Closing the websocket connection gracefully.
    api.disconnect();
}
```
