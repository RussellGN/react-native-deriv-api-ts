export default class Exception extends Error {
    #code;
    #params;
    constructor(code, message, params) {
        super(message);
        this.#code = code;
        this.#params = params;
    }
    get code() {
        return this.#code;
    }
    getParams() {
        return this.#params;
    }
}
