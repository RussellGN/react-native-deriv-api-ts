export default class Exception extends Error
{
	readonly #code: string;
	
	constructor(code: string, message: string)
	{
		super(message);
		this.#code = code;
	}
	
	get code()
	{
		return this.#code;
	}
}
