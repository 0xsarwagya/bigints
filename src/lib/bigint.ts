const MAX_BYTES = 36;
const PRECISION_BYTES = 18;

const E = "2.718281828459045235";
const LN_10 = "2.302585092994045684";
const LN_2 = "0.693147180559945309";
const NEGATIVE_INFINITY = BigInt(
	`-1${Array.from({ length: MAX_BYTES }, () => "0").join("")}`,
);
const PI = "3.141592653589793238";
const POSITIVE_INFINITY = BigInt(
	`1${Array.from({ length: MAX_BYTES }, () => "0").join("")}`,
);
const PRECISION = BigInt(
	`1${Array.from({ length: PRECISION_BYTES }, () => "0").join("")}`,
);

export class BigNumber {
	private _sign: boolean;
	private _value: string;
	private _decimal: string;

	// Private Utility Methods

	private static fixDecimalDigits(number: string): string {
		if (number.length >= PRECISION_BYTES)
			return number.substring(0, PRECISION_BYTES);

		return "0".repeat(PRECISION_BYTES - number.length) + number;
	}

	private static roundString(_number: string, precision: number): string {
		if (_number.length <= precision) return _number;

		const number = _number.split("");

		if (number[precision] === undefined) {
			return number.join("");
		}

		const lastDigit = Number.parseInt(number[precision]!); // added non-null assertion operator

		if (lastDigit < 5) return number.slice(0, precision).join("");

		let index = precision - 1;

		while (index > 0 && number[index] === "9") {
			number[index] = "0";
			index--;
		}

		if (index === 0) {
			if (number[index] === "9") {
				number[index] = "0";
				return `1${number.join("")}`;
			}
			number[index] = (Number.parseInt(number[index]!) + 1).toString(); // added non-null assertion operator
			return number.join("");
		}
		number[index] = (Number.parseInt(number[index]!) + 1).toString(); // added non-null assertion operator
		return number.slice(0, precision).join("");
	}

	private static widenScientificNotation(number: string): string {
		if (!number.includes("e")) return number;

		const [mantissa, exponent] = number.split("e");
		const exponentValue = Number.parseInt(exponent || "0");

		if (exponentValue < 0) {
			return `0.${"0".repeat(-exponentValue - 1)}${(mantissa || "").replace(".", "")}`;
		}
		const result =
			(mantissa || "").replace(".", "") + "0".repeat(exponentValue);
		return result;
	}

	private constructor(sign: boolean, value: string, decimal: string) {
		if (Number.isNaN(Number(value)) || Number.isNaN(Number(decimal)))
			throw Error("BigNumber Error: Unrecognized number format.");

		if (
			BigInt(value) > POSITIVE_INFINITY ||
			(BigInt(value) === POSITIVE_INFINITY && BigInt(decimal) !== BigInt(0))
		)
			throw Error(
				`BigNumber Error: You cannot have a BigNumber bigger than ${POSITIVE_INFINITY}.`,
			);

		if (
			BigInt(value) < NEGATIVE_INFINITY ||
			(BigInt(value) === NEGATIVE_INFINITY && BigInt(decimal) !== BigInt(0))
		)
			throw Error(
				`BigNumber Error: You cannot have a BigNumber smaller than ${NEGATIVE_INFINITY}.`,
			);

		this._sign = sign;
		this._value = value;

		if (decimal.length >= PRECISION_BYTES) {
			const newDecimal = BigNumber.roundString(decimal, PRECISION_BYTES);

			if (newDecimal.length > PRECISION_BYTES) {
				this._value = (BigInt(value) + BigInt(1)).toString();
				this._decimal = "0".repeat(PRECISION_BYTES);
			} else {
				this._decimal = newDecimal;
			}
		} else {
			this._decimal = decimal.padEnd(PRECISION_BYTES, "0");
		}
	}

	// Static Constructors

	static copysign(number: BigNumber, sign: BigNumber): BigNumber {
		return new BigNumber(sign._sign, number._value, number._decimal);
	}

	static fromBigInt(value: bigint): BigNumber {
		return new BigNumber(
			value >= 0n,
			(value < 0n ? -value : value).toString(),
			"0",
		);
	}

	static fromString(value: string): BigNumber {
		const numberAsString = BigNumber.widenScientificNotation(
			value.replace(",", "."),
		);

		if (numberAsString.split(".").length > 2)
			throw Error(
				"BigNumber Error: The given string cannot be parsed to a BigNumber.",
			);

		const sign = numberAsString[0] !== "-";
		const cleanedNumber = sign ? numberAsString : numberAsString.substring(1);

		if (!/^[\d.]+$/.test(cleanedNumber))
			throw Error(
				"BigNumber Error: The given string cannot be parsed to a BigNumber.",
			);

		const [valueAsString, decimalAsString = "0"] = cleanedNumber.split(".");

		if (valueAsString === undefined)
			throw Error(
				"BigNumber Error: The given string cannot be parsed to a BigNumber.",
			);

		return new BigNumber(sign, valueAsString, decimalAsString);
	}

	// Static Constants

	static E: BigNumber = BigNumber.fromString(E);
	static EULER: BigNumber = BigNumber.fromString(E);
	static INF: BigNumber = BigNumber.fromBigInt(POSITIVE_INFINITY);
	static POSITIVE_INFINITY: BigNumber = BigNumber.fromBigInt(POSITIVE_INFINITY);
	static NEG_INF: BigNumber = BigNumber.fromBigInt(NEGATIVE_INFINITY);
	static NEGATIVE_INFINITY: BigNumber = BigNumber.fromBigInt(NEGATIVE_INFINITY);
	static LN_10: BigNumber = BigNumber.fromString(LN_10);
	static LN_2: BigNumber = BigNumber.fromString(LN_2);
	static PI: BigNumber = BigNumber.fromString(PI);

	// Type Conversion Methods

	toBigInt(): bigint {
		return (
			BigInt(this._sign ? 1 : -1) *
			(BigInt(this._value) +
				BigInt(
					this._decimal[0] && Number.parseInt(this._decimal[0]) >= 5 ? 1 : 0,
				))
		);
	}

	toString(): string {
		return `${(this._sign ? "" : "-") + this._value}.${this._decimal}`;
	}

	toInteger(): string {
		return (
			(this._sign ? "" : "-") +
			BigNumber.roundString(
				this._value + (this._decimal[0] ?? ""),
				this._value.length,
			)
		);
	}

	// Type Check Methods

	isInteger(): boolean {
		return BigInt(this._decimal) === 0n;
	}

	isPositive(): boolean {
		return this._sign;
	}

	// Arithmetic Conversion Methods

	abs(): BigNumber {
		return new BigNumber(true, this._value, this._decimal);
	}

	ceil(): BigNumber {
		return new BigNumber(
			this._sign,
			(
				BigInt(this._value) +
				(!this._sign || BigInt(this._decimal) === 0n ? 0n : 1n)
			).toString(),
			"0",
		);
	}

	floor(): BigNumber {
		return new BigNumber(
			this._sign,
			(
				BigInt(this._value) +
				(!this._sign && BigInt(this._decimal) !== 0n ? 1n : 0n)
			).toString(),
			"0",
		);
	}

	inv(): BigNumber {
		return BigNumber.fromBigInt(1n).div(this);
	}

	neg(): BigNumber {
		return new BigNumber(!this._sign, this._value, this._decimal);
	}

	round(): BigNumber {
		return new BigNumber(
			this._sign,
			(
				BigInt(this._value) +
				BigInt(
					this._decimal[0] && Number.parseInt(this._decimal[0]) >= 5 ? 1 : 0,
				)
			).toString(),
			"0",
		);
	}

	trunc(): BigNumber {
		return new BigNumber(this._sign, this._value, "0");
	}

	// Logic Comparison Methods

	equals(other: BigNumber): boolean {
		return (
			this._sign === other._sign &&
			this._value === other._value &&
			this._decimal === other._decimal
		);
	}

	gt(other: BigNumber): boolean {
		if (this._sign !== other._sign) return this._sign;
		const valueComparison = BigInt(this._value) - BigInt(other._value);
		if (valueComparison !== 0n)
			return this._sign ? valueComparison > 0n : valueComparison < 0n;
		return this._sign
			? BigInt(this._decimal) > BigInt(other._decimal)
			: BigInt(this._decimal) < BigInt(other._decimal);
	}

	greaterThan = this.gt;

	gte(other: BigNumber): boolean {
		return this.gt(other) || this.equals(other);
	}

	greaterThanOrEqual = this.gte;

	lt(other: BigNumber): boolean {
		return !this.gte(other);
	}

	lessThan = this.lt;

	lte(other: BigNumber): boolean {
		return !this.gt(other);
	}

	lessThanOrEqual = this.lte;

	// Arithmetic Methods

	add(other: BigNumber): BigNumber {
		if (this._sign === other._sign) {
			const addedValue = (
				BigInt(this._value) + BigInt(other._value)
			).toString();
			const addedDecimal = BigNumber.roundString(
				(BigInt(this._decimal) + BigInt(other._decimal)).toString(),
				PRECISION_BYTES,
			);

			return new BigNumber(this._sign, addedValue, addedDecimal);
		}
		if (this.abs().gt(other.abs())) {
			return new BigNumber(
				this._sign,
				(BigInt(this._value) - BigInt(other._value)).toString(),
				(BigInt(this._decimal) - BigInt(other._decimal)).toString(),
			);
		}
		return other.add(this.neg());
	}

	sub(other: BigNumber): BigNumber {
		return this.add(other.neg());
	}

	div(other: BigNumber): BigNumber {
		// Division logic (not implemented fully)
		return this;
	}

	mul(other: BigNumber): BigNumber {
		// Multiplication logic (not implemented fully)
		return this;
	}
}
