export default class Exception extends Error {
   readonly #code: string;
   readonly #params?: Record<string, unknown>;

   constructor(code: string, message: string, params?: Record<string, unknown>) {
      super(message);
      this.#code = code;
      this.#params = params;
   }

   get code() {
      return this.#code;
   }

   public getParams(): Record<string, unknown> | undefined {
      return this.#params;
   }
}
