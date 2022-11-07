import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import ParsedOutput from "../parsed_output.js";
import UsageParser from "../usage_parser.js";

describe("UsageParser", () => {
    describe("#parse", () => {
        describe("Given a single string", () => {
            let input;

            beforeEach(() => {
                input = "7291,293451";
            });
            it("Returns an array with one parsed result", async () => {
                const result = await UsageParser.parse(input);
                expect(result).not.toBeUndefined();
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(1);
            });
        });

        describe("Given an invalid input", () => {
            let input;

            beforeEach(() => {
                input = "";
            });

            it("Should return an internal exception and result in an empty ParsedOutput", async () => {
                let result = await UsageParser.parse(input);
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(1);
                let err = result.pop();
                expect(err.error).not.toBeUndefined();
                expect(err.error).toHaveLength;
            });
        });

        describe("Given an array of strings, all valid except the last one.", () => {
            let input;

            beforeEach(() => {
                input = [
                    "4,0d39f,0,495594,214",
                    "16,be833279000000c063e5e63d",
                    "9991,2935",
                    "a,s",
                ];
            });

            it("Should return an array with every valid input parsed. The last invalid input should be an empty ParsedOut.", async () => {
                const result = await UsageParser.parse(input);
                expect(result).not.toBeUndefined();
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(input.length);
                let err = result.pop();
                expect(err.error).not.toBeUndefined();
                expect(err.error).toHaveLength;
            });
        });
    });

    describe("#parseLine", () => {
        describe("Given a line with a valid ID regardless of value", () => {
            let input;
            let usageParser;
            let id;

            beforeEach(() => {
                input = "7291,1";
                id = 7291;
                usageParser = UsageParser.getInstance(input);
            });

            it("Should call getLastDigitFromId() once", async () => {
                const spy = jest.spyOn(usageParser, "getLastDigitFromId");
                await usageParser.parseLine();
                expect(spy).toHaveBeenCalledTimes(1);
            });

            it("Makes sure the returned instance is of the proper type, and the id has been extracted from the input.", async () => {
                const result = await usageParser.parseLine();
                expect(result).not.toBeUndefined();
                expect(result).toBeInstanceOf(ParsedOutput);
                expect(result.id).toBe(id);
            });
        });

        describe("Given a line with an ID that does not end with 4 or 6", () => {
            let input;
            let usageParser;

            beforeEach(() => {
                input = "7291,1";
                usageParser = UsageParser.getInstance(input);
            });

            it("Will call parseBasicData()", async () => {
                const spy = jest.spyOn(usageParser, "parseBasicData");
                await usageParser.parseLine(input);
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });

        describe("Given a line with an ID that ends in 4", () => {
            let input;
            let usageParser;

            beforeEach(() => {
                input = "7194,b33,394,495593,192";
                usageParser = UsageParser.getInstance(input);
            });
            it("Will call parseExtendedData", async () => {
                const spy = jest.spyOn(usageParser, "parseExtendedData");
                await usageParser.parseLine(input);
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });

        describe("Given a line with an ID that ends in 6", () => {
            let input;
            let usageParser;

            beforeEach(() => {
                input = "316,0e893279227712cac0014aff";
                usageParser = UsageParser.getInstance(input);
            });
            it("Will call parseHexData", async () => {
                const spy = jest.spyOn(usageParser, "parseHexData");
                await usageParser.parseLine(input);
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("#parseBasicData", () => {
        let input;
        let usageParser;
        let expected;

        beforeEach(() => {
            input = "7291,293451";
            usageParser = UsageParser.getInstance(input);
            expected = {
                id: 7291,
                bytes_used: 293451,
                mnc: null,
                dmcc: null,
                cellid: null,
                ip: null,
            };
        });

        it("Returns object with 'id' and 'bytes_used'. All other fields are 'null'", async () => {
            const result = await usageParser.parseBasicData();
            expect(result).not.toBeUndefined();
            expect(result).toBeInstanceOf(ParsedOutput);
            expect(result).toEqual(expected); // checks both values and nulls
        });
    });

    describe("#parseExtendedData", () => {
        let input;
        let usageParser;
        let expected;
        let result;

        beforeEach(() => {
            input = "7194,b33,394,495593,192";
            usageParser = UsageParser.getInstance(input);
            expected = {
                id: 7194,
                bytes_used: 495593,
                mnc: 394,
                dmcc: "b33",
                cellid: 192,
                ip: null,
            };
        });

        it("Returns object with 'id', 'bytes_used', 'mnc', 'dmcc' and 'cellid'. All other fields are 'null'", async () => {
            result = await usageParser.parseExtendedData();
            expect(result).not.toBeUndefined();
            expect(result).toBeInstanceOf(ParsedOutput);
            expect(result).toEqual(expected); // checks both values and nulls
        });
    });

    describe("#parseHexData", () => {
        let input;
        let usageParser;
        let expected;

        beforeEach(() => {
            input = "316,0e893279227712cac0014aff";
            usageParser = UsageParser.getInstance(input);
            expected = {
                id: 316,
                bytes_used: 12921,
                mnc: 3721,
                dmcc: null,
                cellid: 578228938,
                ip: "192.1.74.255",
            };
        });

        it("Returns object with id, bytes_used, mnc, cellid and ip. All other fields are null", async () => {
            const result = await usageParser.parseHexData();
            expect(result).not.toBeUndefined();
            expect(result).toBeInstanceOf(ParsedOutput);
            expect(result).toEqual(expected); // checks both values and nulls
        });        
    });

    describe("#getIP", () => {
        let input;
        let expected;

        beforeEach(() => {
            input = "c0a80001";
            expected = "192.168.0.1";
        });

        it("Should return string representation of the IP passed in as a hex string", () => {
            const result = UsageParser.getIP(input);
            expect(result).not.toBeUndefined();
            expect(result).toEqual(expected); // checks both values and nulls
        });
    });
});
