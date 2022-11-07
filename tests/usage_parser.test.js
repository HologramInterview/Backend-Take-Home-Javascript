import { beforeEach, describe, expect, it } from "@jest/globals";
import UsageParser from "../usage_parser.js";

describe.skip("UsageParser", () => {
  describe("#parse", () => {
    describe("Given a single string", () => {
      describe("Given an ID that does not end with 4 or 6", () => {
        let input;
        let expected;

        beforeEach(() => {
          input = "7291,293451";
          expected = {
            id: 7291,
            bytes_used: 293451,
            mnc: null,
            dmcc: null,
            cellid: null,
            ip: null,
          };
        });

        it("Then it will return basic string data", () => {
          const result = UsageParser.parse(input);
          expect(result).not.toBeUndefined();
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(1);
          expect(result.pop()).toEqual(expected);
        });
      });

      describe("Given an ID that ends with 4", () => {
        let input;
        let expected;

        beforeEach(() => {
          input = "7194,b33,394,495593,192";
          expected = {
            id: 7194,
            bytes_used: 495593,
            mnc: 394,
            dmcc: "b33",
            cellid: 192,
            ip: null,
          };
        });

        it("Then it will return extended string data", () => {
          const result = UsageParser.parse(input);
          expect(result).not.toBeUndefined();
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(1);
          expect(result.pop()).toEqual(expected);
        });
      });

      describe("Given an ID that ends with 6", () => {
        let input;
        let expected;

        beforeEach(() => {
          input = "316,0e893279227712cac0014aff";
          expected = {
            id: 316,
            bytes_used: 12921,
            mnc: 3721,
            dmcc: null,
            cellid: 578228938,
            ip: "192.1.74.255",
          };
        });

        it("Then it will return hex string data", () => {
          const result = UsageParser.parse(input);
          expect(result).not.toBeUndefined();
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(1);
          expect(result.pop()).toEqual(expected);
        });
      });
    });

    describe("Given an array of strings", () => {
      let input;
      let expected;

      beforeEach(() => {
        input = [
          "4,0d39f,0,495594,214",
          "16,be833279000000c063e5e63d",
          "9991,2935",
        ];
        expected = [
          {
            id: 4,
            bytes_used: 495594,
            mnc: 0,
            dmcc: "0d39f",
            cellid: 214,
            ip: null,
          },
          {
            id: 16,
            bytes_used: 12921,
            mnc: 48771,
            dmcc: null,
            cellid: 192,
            ip: "99.229.230.61",
          },
          {
            id: 9991,
            bytes_used: 2935,
            mnc: null,
            dmcc: null,
            cellid: null,
            ip: null,
          },
        ];
      });

      it("Then it will parse each string according to its ID and return an array of data", () => {
        const result = UsageParser.parse(input);
        expect(result).not.toBeUndefined();
        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(expected.length);
        result.forEach((item, index) => {
          expect(item).toEqual(expected[index]);
        });
      });
    });
  });
});
