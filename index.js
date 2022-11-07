import ParsedOutput from "./parsed_output.js";
import UsageParser from "./usage_parser.js";

import express from "express";
import http from "http";
const app = express();

app.use(express.json());

const server = http.createServer(app);

const port = 4321;

/**
 * '/parse' endpoint should be used for parsing a single usage string.
 */
app.get("/parse", async (req, res) => {
    const input = await getSingleInputFromParams(req);
    let parsedOutput = await UsageParser.parse(input);
    let val = await parsedOutput.pop();
    if (val.error && val.error.length >= 0) {
        console.log(`Error. Code=404 Type=ParseFailure InputLine=${input}`);
        res.status(404).send(val);
    } else {
        res.status(200).send(val);
    }
});

/**
 * '/bulk-parse' endpoint should be used for parsing multiple usage strings in bulk.
 */
app.get("/bulk-parse", async (req, res) => {

    const input = await getBulkInputFromParams(req);
    let parsedOutput = await UsageParser.parse(input);
    let errors = await parsedOutput.filter(val => (val.error && val.error.length >= 0));
    if (errors.length > 0) {
        let errType = 'SomeInputLinesHadErrors';
        if (errors.length === parsedOutput.length) {
            errType = 'AllInputLinesHadErrors';
        }
        console.log(`Error. Code=404 Type=${errType} Number of errors=${errors.length}`);
        res.status(404).send(parsedOutput);
    } else {
        res.status(200).send(parsedOutput);
    }
});

// start server listening on port 
server.listen(port, () => {
    console.log(`Server up & running on port:${port}`);
});


function getSingleInputFromParams(req) {
    // ToDo: sanitize before returning!!!
    return req.query.input;
}

function getBulkInputFromParams(req) {
    // ToDo: sanitize before returning!!!
    return req.body;
}
