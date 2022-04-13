/* eslint-disable camelcase */

import Exception from './Exception';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import DerivAPI from '@deriv/deriv-api';
import type * as Types from '@deriv/api-types';
import { LogOutRequest } from '@deriv/api-types';
import Logger from './Logger';
import { Observable } from 'rxjs';
import WebSocket from 'ws';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Object.assign(global, { WebSocket });

export interface BinaryApiBasicType {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	onOpen: () => Observable<string>;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	onClose: () => Observable<string>;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	onMessage: () => Observable<string>;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	disconnect: () => void;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	connection?: WebSocket|null;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	keep_alive_interval: number;
	[k: string]: <Req, Res>(params: Req) => Promise<Res>;
}

export type BinaryApiType = {
	new(object: { app_id: number, lang: string }): BinaryApiType;
	basic: BinaryApiBasicType;
};

export interface BinaryApiResponseType
{

	/**
	 * Echo of the request made.
	 */
	echo_req: {
		[k: string]: unknown;
	};
	
	/**
	 * Error details
	 */
	error?: {
		code: string;
		message: string;
		details: { [k: string]: unknown };
	},
	
	/**
	 * Action name of the request made.
	 */
	msg_type: string;
	
	/**
	 * Optional field sent in request to map to response, present only when request contains `req_id`.
	 */
	req_id?: number;
	
	[k: string]: unknown;
}

export class DerivAPIWrapper
{
	readonly #appId: number;
	readonly #api: BinaryApiType;
	readonly #logger = new Logger('DerivAPI');
	#authorized = false;
	#token?: string;
	#noAuthEndpoints = [ 'authorize', 'websiteStatus', 'proposal' ];
	
	constructor(appId: number, token?: string)
	{
		this.#appId = appId;
		this.#token = token;
		
		this.#api = new (DerivAPI as BinaryApiType)({ app_id: appId, lang: 'EN' });
		
		this.#api.basic.onOpen().subscribe((x) => this.#logger.debug('onOpen %s', x));
		this.#api.basic.onClose().subscribe((x) => this.#logger.debug('onClose %s', x));
		this.#api.basic.onMessage().subscribe((msg) => this.#logger.debug('onMessage [msg=%O]', msg));
	}
	
	async #call<Req, Res extends BinaryApiResponseType>(
		methodName: string,
		params: Req
	): Promise<NonNullable<Res[Res['msg_type']]>>
	{
		if (!this.#authorized && !this.#noAuthEndpoints.includes(methodName))
		{
			await this.authorize();
		}
		
		return (this.#api.basic)[methodName]<Req, Res>(params)
			.then((result) =>
			{
				if (result[result.msg_type])
				{
					return result[result.msg_type] as NonNullable<Res[Res['msg_type']]>;
				}
				else
				{
					const errResult = result as BinaryApiResponseType;
					
					if (errResult.error)
					{
						throw new Exception(errResult.error.code, errResult.error.message);
					}
					throw new Exception('Unknown', 'Unknown error occurred');
				}
			})
			.catch((err) =>
			{
				if (err instanceof Exception)
				{
					throw err;
				}
				else
				{
					const errResult = err as BinaryApiResponseType;

					if (errResult.error)
					{
						throw new Exception(errResult.error.code, errResult.error.message, errResult.error.details);
					}
					throw new Exception('Unknown', 'Unknown error occurred');
				}
			});
	}
	
	public async websiteStatus()
	{
		const params: Types.ServerStatusRequest = {
			website_status : 1
		};
		
		return await this.#call<Types.ServerStatusRequest, Types.ServerStatusResponse>('websiteStatus', params);
	}
	
	public async authorize(token?: string)
	{
		this.#token = token || this.#token;
		if (!this.#token)
		{
			throw new Exception('MISSING_ARGUMENT', 'You must specify token parameter');
		}
		const params: Types.AuthorizeRequest = {
			authorize : this.#token
		};
		
		this.#authorized = false;
		
		return this.#call<Types.AuthorizeRequest, Types.AuthorizeResponse>('authorize', params)
			.then((authResult) =>
			{
				this.#authorized = true;
			
				return authResult;
			});
	}
	
	public async logout()
	{
		if (!this.#authorized)
		{
			return Promise.resolve();
		}
		const params: LogOutRequest = {
			logout : 1
		};
		
		return this.#call<Types.LogOutRequest, Types.LogOutResponse>('logout', params)
			.then(() =>
			{
				this.#authorized = false;
			});
	}
	
	public disconnect()
	{
		// This code block can be removed when PR#101 (https://github.com/binary-com/deriv-api/pull/101) is merged.
		if (this.#api.basic.keep_alive_interval)
		{
			clearInterval(this.#api.basic.keep_alive_interval);
			this.#api.basic.keep_alive_interval = 0;
		}
		
		this.#api.basic.disconnect();

		this.#authorized = false;
	}
	
	public async profitTable(params: Types.ProfitTableRequest)
	{
		return await this.#call<Types.ProfitTableRequest, Types.ProfitTableResponse>('profitTable', params);
	}
	
	public async portfolio(params: Types.PortfolioRequest)
	{
		return await this.#call<Types.PortfolioRequest, Types.PortfolioResponse>('portfolio', params);
	}
	
	/**
	 * Buy a Contract for multiple Accounts specified by the `tokens` parameter.
	 * @param {Types.BuyContractForMultipleAccountsRequest} params
	 * @return {Promise<Types.BuyContractForMultipleAccounts>}
	 */
	public async buyContractForMultipleAccounts(params: Types.BuyContractForMultipleAccountsRequest)
	{
		return await this.#call<Types.BuyContractForMultipleAccountsRequest, Types.BuyContractForMultipleAccountsResponse>('buyContractForMultipleAccounts', params);
	}
	
	/**
	 * Gets latest price for a specific contract.
	 * @param {Types.PriceProposalRequest} params
	 * @return {Promise<Types.Proposal>}
	 */
	public async proposal(params: Types.PriceProposalRequest)
	{
		return await this.#call<Types.PriceProposalRequest, Types.PriceProposalResponse>('proposal', params);
	}
}

export { Exception };
export type { Types };
