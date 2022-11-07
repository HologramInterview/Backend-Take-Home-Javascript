import ParsedOutput from "./parsed_output.js";

class UsageParser {

    parsedOutput = null; // A ParsedOutput object to store output as the input gets parsed
    rawValue = null; // A string to hold the raw input sans the id.

    /**
     * Given  a line, the constructor parses the id, builds the ParsedOutput instance 
     * and initializes it with the parsed id.
     * It also stores the raw data to be parsed later 
     * 
     * @param string line
     */
    constructor(line) {
        /**
         * Every line has at least two comma-separated values.
         * The first one will always be the `id`.
         * The second one contains the raw data.
         */

        const regexIdValue = /^(\d+),(.+)/;
        const matchResult = line.match(regexIdValue);
        if (!matchResult) {
            throw "Invalid input. Unable to find id and value";
        }
        this.parsedOutput = new ParsedOutput({
            id: parseInt(matchResult[1]), // stores the parsed id in parsedOutput
        });
        this.rawValue = matchResult[2]; // stores the data as rawValue to be used as input to continue parsing. 
    }

    /**
     *
     * @returns string
     */
    getLastDigitFromId() {
        return this.parsedOutput.getLastDigitFromId();
    }

    /**
     *
     * Transforms a hex string of 8 characters (4 "bytes") into it's string representation of four numbers separated by a period.
     *      e.g. `c0a80001` would be `'192.168.0.1'`
     *            c0=192 a8=168 00=0 01=1
     * Each "byte" of the string (**two characters, e.g. `c0`**) is one segment of the ip.
     *
     * @param String ipStr hex string representation of an ip address. Contains the 4 segments of the ip.
     * @returns String representation of ipStr (four segments separated by a period). Each segment corresponds to the hex bytes in inStr
     */
    static getIP(ipStr) {
        return [
            UsageParser.convertToIntFromHex(ipStr.substring(0, 2)),
            UsageParser.convertToIntFromHex(ipStr.substring(2, 4)),
            UsageParser.convertToIntFromHex(ipStr.substring(4, 6)),
            UsageParser.convertToIntFromHex(ipStr.substring(6, 8)),
        ].join(".");
    }

    static convertToInt(value, radix = 10) {
        let parsedValue = parseInt(value, radix);
        return !isNaN(parsedValue) ? parsedValue : null;
    }

    static convertToIntFromHex(value) {
        return this.convertToInt(value, 16);
    }

    /**
     * Basic strings are comma separated with just two values, the id and the bytes used, both integers.
     *      `<id>,<bytes_used>`
     *
     * @returns ParsedOutput
     */
    async parseBasicData() {
        return await this.parsedOutput.addToParsedOutput({
            bytes_used: UsageParser.convertToInt(this.rawValue),
        });
    }

    /**
     * Extended strings are comma separated with values for multiple fields.
     * All values are integers except `dmcc` which is a string.
     * Fields are always in the same order.
     *      `<id>,<dmcc>,<mnc>,<bytes_used>,<cellid>`
     *
     * @returns ParsedOutput
     */
    async parseExtendedData() {
        const regexExtendedData = /^(.*?),?(\d*),?(\d*),?(\d*)$/;
        const matchResult = this.rawValue.match(regexExtendedData);
        if (!matchResult) {
            throw `Invalid input. Unable to match the ExtendedData pattern to the value=${this.rawValue}`;
        }
        return await this.parsedOutput.addToParsedOutput({
            dmcc: matchResult[1],
            mnc: UsageParser.convertToInt(matchResult[2]),
            bytes_used: UsageParser.convertToInt(matchResult[3]),
            cellid: UsageParser.convertToInt(matchResult[4]),
        });
    }

    /**
     *
     * Hex strings consist of two comma separate values:
     *      `<id>,<hex>`
     * the id, and a string of hex bytes representing more rich data.
     * To access the values, the hex string will have to be parsed.
     *
     * The hex string is a 24-character (12-byte) non-separated string with fixed position elements noted below.
     * Each byte of the string (**two characters, e.g. `a0`**) is part of a value.
     * Hex values should be converted to appropriate types when they parsed into fields.
     * All values are integers (e.g. `3a09` would be `14857`) except for `ip` which is a string.
     *  - Bytes 1-2 → `mnc`
     *  - Bytes 3-4 > `bytes_used`
     *  - Bytes 5-8 → `cellid`
     *  - Bytes 9-12 → `ip`
     *      - String
     *      - Each byte is one segment of the ip, separated by a period: e.g. `c0a80001` would be `'192.168.0.1'`
     *
     * @returns ParsedOutput
     */
    async parseHexData() {
        return await this.parsedOutput.addToParsedOutput({
            mnc: UsageParser.convertToIntFromHex(this.rawValue.substring(0, 4)),
            bytes_used: UsageParser.convertToIntFromHex(this.rawValue.substring(4, 8)),
            cellid: UsageParser.convertToIntFromHex(this.rawValue.substring(8, 16)),
            ip: UsageParser.getIP(this.rawValue.substring(16, 24)),
        });
    }

    /**
     * Parses a single line of input.
     * All strings will have at least two comma-separated values. The first value will always be the `id`.
     * - IDs ending with 4 should use the “extended” string parsing scheme to store the data
     * - IDs ending with 6 should use the “hex” string parsing scheme
     * - All other IDs should use the “basic” string parsing scheme
     *
     * @returns ParsedOutput
     */
    async parseLine() {
        switch (this.getLastDigitFromId()) {
            case "4":
                return await this.parseExtendedData();
            case "6":
                return await this.parseHexData();
            default:
                return await this.parseBasicData();
        }
    }

    /**
     * The `parse` method accepts a usage string or an array of usage strings.
     * It parses each usage string and returns an array of corresponding ParsedOutput objects.
     * When the parsing of usage strings fails, the corresponding ParsedOutput object contains 
     * information related to the error.
     *
     * @param {*} input
     * @returns array
     */
    static async parse(input) {
        if (!Array.isArray(input)) {
            input = [input];
        }
        return input.map((line) => {
            try {
                return UsageParser.getInstance(line).parseLine();
            } catch (e) {
                console.log(`Skiping parsing of line='${line}' message='${e}'`);
                return new ParsedOutput();
            }
        });
    }

    /**
     * Instance factory
     * 
     * @param string line
     * @returns UsageParser
     */
    static getInstance(line) {
        return new UsageParser(line);
    }

    /**
     *
     * @returns int
     */
    getParsedId() {
        return this.parsedOutput.id;
    }

}

export default UsageParser;
