import { equal, throws } from "node:assert/strict";
import { describe, it } from "node:test";
import { BigNumber } from "../index.ts"; // Adjust this import path to your file

describe("BigNumber Class Tests", () => {
	describe("Constructor Tests", () => {
		it("should create a BigNumber from a string", () => {
			const number = BigNumber.fromString("123.456");
			equal(number.toString(), "123.456000000000000000");
		});

		it("should throw an error for invalid string input", () => {
			throws(() => BigNumber.fromString("12..34"), {
				message:
					"BigNumber Error: The given string cannot be parsed to a BigNumber.",
			});
		});

		it("should create a BigNumber from a bigint", () => {
			const number = BigNumber.fromBigInt(123456n);
			equal(number.toString(), "123456.000000000000000000");
		});
	});

	describe("Arithmetic Methods", () => {
		it("should correctly add two BigNumbers", () => {
			const num1 = BigNumber.fromString("123.456");
			const num2 = BigNumber.fromString("100.100");
			const result = num1.add(num2);
			equal(result.toString(), "223.556000000000000000");
		});

		it("should correctly subtract two BigNumbers", () => {
			const num1 = BigNumber.fromString("123.456");
			const num2 = BigNumber.fromString("100.100");
			const result = num1.sub(num2);
			equal(result.toString(), "23.356000000000000000");
		});

		it("should correctly negate a BigNumber", () => {
			const num = BigNumber.fromString("123.456");
			const negNum = num.neg();
			equal(negNum.toString(), "-123.456000000000000000");
		});
	});

	describe("Comparison Methods", () => {
		it("should return true when comparing two equal BigNumbers", () => {
			const num1 = BigNumber.fromString("123.456");
			const num2 = BigNumber.fromString("123.456");
			equal(num1.equals(num2), true);
		});

		it("should return false for greater-than comparison of smaller BigNumber", () => {
			const num1 = BigNumber.fromString("100.456");
			const num2 = BigNumber.fromString("200.456");
			equal(num1.gt(num2), false);
		});

		it("should return true for greater-than comparison of larger BigNumber", () => {
			const num1 = BigNumber.fromString("300.456");
			const num2 = BigNumber.fromString("200.456");
			equal(num1.gt(num2), true);
		});
	});

	describe("Type Conversion Methods", () => {
		it("should convert BigNumber to BigInt", () => {
			const num = BigNumber.fromString("123.456");
			equal(num.toBigInt(), 123n);
		});

		it("should return a string representation of the BigNumber", () => {
			const num = BigNumber.fromString("123.456");
			equal(num.toString(), "123.456000000000000000");
		});

		it("should convert BigNumber to integer string", () => {
			const num = BigNumber.fromString("123.789");
			equal(num.toInteger(), "124");
		});
	});

	describe("Utility Methods", () => {
		it("should return the absolute value of a negative BigNumber", () => {
			const num = BigNumber.fromString("-123.456");
			const absNum = num.abs();
			equal(absNum.toString(), "123.456000000000000000");
		});

		it("should return the ceiling value of a BigNumber", () => {
			const num = BigNumber.fromString("123.456");
			const ceilNum = num.ceil();
			equal(ceilNum.toString(), "124.000000000000000000");
		});

		it("should return the floor value of a BigNumber", () => {
			const num = BigNumber.fromString("123.456");
			const floorNum = num.floor();
			equal(floorNum.toString(), "123.000000000000000000");
		});

		it("should round the BigNumber correctly", () => {
			const num = BigNumber.fromString("123.789");
			const roundNum = num.round();
			equal(roundNum.toString(), "124.000000000000000000");
		});

		it("should return true for positive BigNumber", () => {
			const num = BigNumber.fromString("123.456");
			equal(num.isPositive(), true);
		});

		it("should return false for negative BigNumber", () => {
			const num = BigNumber.fromString("-123.456");
			equal(num.isPositive(), false);
		});
	});

	describe("Edge Cases", () => {
		it("should handle small decimal values correctly", () => {
			const num = BigNumber.fromString("0.000000000000000001");
			equal(num.toString(), "0.000000000000000001");
		});

		it("should handle large values correctly", () => {
			const num = BigNumber.fromString(
				"999999999999999999999.999999999999999999",
			);
			equal(num.toString(), "999999999999999999999.999999999999999999");
		});

		it("should handle positive infinity", () => {
			const num = BigNumber.POSITIVE_INFINITY;
			equal(num.toBigInt(), BigInt(`1${"0".repeat(36)}`));
		});

		it("should handle negative infinity", () => {
			const num = BigNumber.NEGATIVE_INFINITY;
			equal(num.toBigInt(), BigInt(`-1${"0".repeat(36)}`));
		});
	});
});
