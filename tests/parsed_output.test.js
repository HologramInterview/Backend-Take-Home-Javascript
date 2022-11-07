import { beforeEach, describe, expect, it } from "@jest/globals";
import ParsedOutput from "../parsed_output.js";

describe("ParsedOutput", () => {
    describe("#constructor", () => {
        describe("With most common valid input", () => {
            let input;
            let expected;

            beforeEach(() => {
                input = {
                    id: 123,
                };
                expected = {
                    id: 123,
                    dmcc: null,
                    ip: null,
                    mnc: null,
                    bytes_used: null,
                    cellid: null,
                };
            });

            it("creates an instance initialized with the input", () => {
                const result = new ParsedOutput(input);
                expect(result).not.toBeUndefined();
                expect(result).toBeInstanceOf(ParsedOutput);
                expect(result).toEqual(expected);
            });
        });

        describe("With weird random input", () => {
            let input;

            beforeEach(() => {
                input = {
                    id: "custom id",
                    dmcc: "custom dmcc",
                    ip: "custom ip",
                    mnc: "custom mnc",
                    bytes_used: "custom bytes_used",
                    cellid: "custom cellid",
                    error: "custom error",

                };
            });

            it("creates an instance initialized with the same input", () => {
                const result = new ParsedOutput(input);
                expect(result).not.toBeUndefined();
                expect(result).toBeInstanceOf(ParsedOutput);
                expect(result).toEqual(input);
            });
        });

        describe("With empty input", () => {
            let expected;

            beforeEach(() => {
                expected = {
                    id: null,
                    dmcc: null,
                    ip: null,
                    mnc: null,
                    bytes_used: null,
                    cellid: null,
                };
            });

            it("creates an instance with all fields initialized with null", () => {
                const result = new ParsedOutput();
                expect(result).not.toBeUndefined();
                expect(result).toBeInstanceOf(ParsedOutput);
                expect(result).toEqual(expected);
            });
        });
    });

    describe("#addToParsedOutput", () => {
        let input;
        let input2;
        let expected;
        let parsedOutput;

        beforeEach(() => {
            input = {
                foo: "FOO",
                bar: "BAR",
            };
            input2 = {
                foo: "OOF",
                bar: "RAB",
            };
            expected = {
                foo: "FOO",
                bar: "BAR",
                id: null,
                dmcc: null,
                ip: null,
                mnc: null,
                bytes_used: null,
                cellid: null,
            };
            parsedOutput = new ParsedOutput();

        });
        it("Adds or replaces inside the instance all the keys and values from input", async () => {
            const result = await parsedOutput.addToParsedOutput(input);
            expect(result).not.toBeUndefined();
            expect(result).toBeInstanceOf(ParsedOutput);
            expect(result).toEqual(expected);
            const result2 = await parsedOutput.addToParsedOutput(input2);
            expect(result2.foo).toEqual(input2.foo);
            expect(result2.bar).toEqual(input2.bar);
        });
    });

    describe("#getLastDigitFromId", () => {
        let parsedOutput;

        beforeEach(() => {
   
            parsedOutput = new ParsedOutput();
        });

        it("returns the last digit from the instance's id", async () => {
            const result = await parsedOutput.addToParsedOutput({id:576});
            expect(result).not.toBeUndefined();
            expect(result).toBeInstanceOf(ParsedOutput);
            expect(result.getLastDigitFromId()).toEqual("6");
        })
    })
});
