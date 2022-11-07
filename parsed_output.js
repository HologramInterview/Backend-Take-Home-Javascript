/**
 * Utility and convenience class to collect output parsed from the input.
 * Has no concept of type, all fields are null by default.
 * 
 */
class ParsedOutput {
    id = null;
    dmcc = null;
    ip = null;
    mnc = null;
    bytes_used = null;
    cellid = null;

    /**
     * Constructor receives a literal object with values for a subset of the class's properties.
     *      let po = new ParsedOutput({id:6, bytes_used:123456});
     * All properties and values of obj, will get assigned to the respective instance's properties. 
     * Properties not in obj will be left with their existing values.
     * If obj has properties not in the class, they will be added to the instance (no biggie, no need to add any)
     * it's assumed all values inside obj have been parsed already.
     *
     * @param {*} obj
     */
    constructor(obj = {}) {
        this.addToParsedOutput(obj);
    }
    /**
     *
     * @param {*} obj
     * @returns ParsedOutput
     */
    async addToParsedOutput(obj) {
        if (obj) {
            Object.assign(this, obj);            
        }
        return this;
    }

    /**
     *
     * @returns string
     */
     getLastDigitFromId() {
        const idStr = this.id.toString();
        return idStr.charAt(idStr.length - 1);
    }

}

export default ParsedOutput;
