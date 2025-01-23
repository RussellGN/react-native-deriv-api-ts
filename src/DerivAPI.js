/* eslint-disable camelcase */
import Exception from "./Exception";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import DerivAPI from "@deriv/deriv-api";
import Logger from "./Logger";
import WebSocket from "react-native-websocket";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Object.assign(global, { WebSocket });
export class DerivAPIWrapper {
    #appId;
    #api;
    #logger = new Logger("DerivAPI");
    #authorized = false;
    #token;
    #noAuthEndpoints = ["authorize", "websiteStatus", "proposal"];
    constructor(appId, token) {
        this.#appId = appId;
        this.#token = token;
        this.#api = new DerivAPI({ app_id: appId, lang: "EN" });
        this.#api.basic.onOpen().subscribe((x) => this.#logger.debug("onOpen %s", x));
        this.#api.basic.onClose().subscribe((x) => this.#logger.debug("onClose %s", x));
        this.#api.basic.onMessage().subscribe((msg) => this.#logger.debug("onMessage [msg=%O]", msg));
    }
    async #call(methodName, params) {
        if (!this.#authorized && !this.#noAuthEndpoints.includes(methodName)) {
            await this.authorize();
        }
        return this.#api.basic[methodName](params)
            .then((result) => {
            if (result[result.msg_type]) {
                return result[result.msg_type];
            }
            else {
                const errResult = result;
                if (errResult.error) {
                    throw new Exception(errResult.error.code, errResult.error.message);
                }
                throw new Exception("Unknown", "Unknown error occurred");
            }
        })
            .catch((err) => {
            if (err instanceof Exception) {
                throw err;
            }
            else {
                const errResult = err;
                if (errResult.error) {
                    throw new Exception(errResult.error.code, errResult.error.message, errResult.error.details);
                }
                throw new Exception("Unknown", "Unknown error occurred");
            }
        });
    }
    async websiteStatus() {
        const params = {
            website_status: 1,
        };
        return await this.#call("websiteStatus", params);
    }
    async authorize(token) {
        this.#token = token || this.#token;
        if (!this.#token) {
            throw new Exception("MISSING_ARGUMENT", "You must specify token parameter");
        }
        const params = {
            authorize: this.#token,
        };
        this.#authorized = false;
        return this.#call("authorize", params).then((authResult) => {
            this.#authorized = true;
            return authResult;
        });
    }
    async logout() {
        if (!this.#authorized) {
            return Promise.resolve();
        }
        const params = {
            logout: 1,
        };
        return this.#call("logout", params).then(() => {
            this.#authorized = false;
        });
    }
    disconnect() {
        // This code block can be removed when PR#101 (https://github.com/binary-com/deriv-api/pull/101) is merged.
        if (this.#api.basic.keep_alive_interval) {
            clearInterval(this.#api.basic.keep_alive_interval);
            this.#api.basic.keep_alive_interval = 0;
        }
        this.#api.basic.disconnect();
        this.#authorized = false;
    }
    async profitTable(params) {
        return await this.#call("profitTable", params);
    }
    async portfolio(params) {
        return await this.#call("portfolio", params);
    }
    /**
     * Buy a Contract for multiple Accounts specified by the `tokens` parameter.
     * @param {Types.BuyContractForMultipleAccountsRequest} params
     * @return {Promise<Types.BuyContractForMultipleAccounts>}
     */
    async buyContractForMultipleAccounts(params) {
        return await this.#call("buyContractForMultipleAccounts", params);
    }
    /**
     * Gets latest price for a specific contract.
     * @param {Types.PriceProposalRequest} params
     * @return {Promise<Types.Proposal>}
     */
    async proposal(params) {
        return await this.#call("proposal", params);
    }
}
export { Exception };
