const ValidationError = require("./ValidationError");
const FieldMapper = require("./Field");
const {parse} = require('csv-parse/sync');

class Dataset {
    config = {}
    fieldMappers = []
    format = "csv"

    /**
     * Maps a single dataset in a CAPE system.
     * @param {Object} config - the JSON structure defining a single dataset
     * @throws {ValidationError}
     */
    constructor(config) {

        this.config = config;

        let ids = {};
        this.config['fields'].forEach((fieldConfig, i) => {
            let fieldMapper = new FieldMapper(fieldConfig);
            this.fieldMappers.push(fieldMapper);
            // check the ids are unique
            if (ids.hasOwnProperty(fieldMapper.config.id)) {
                throw ValidationError("Field ID '${fieldMapper.config.id}' was not unique");
            }
            ids[fieldMapper.config.id] = fieldMapper;
        });

        // check the sort fields exist
        this.config['sort'].forEach((field_id, i) => {
            if (!ids.hasOwnProperty(field_id)) {
                throw new ValidationError("Invalid sort field ${field_id}")
            }
        })

        if (!ids.hasOwnProperty(this.config["id_field"])) {
            throw new ValidationError("Invalid id_field ${this.config['id_field']}")
        }

        // format does not need to be passed through to the output json, so remove it and
        // store it as an object property instead
        if (this.config.hasOwnProperty('format')) {
            this.format = this.config['format'];
            delete this.config['format'];
        }

    }

    xslxToTable(bytestream) {
        return [];
    }


    /**
     * Map one or more bytestreams into a list of records for this dataset. This is not stateless as it will
     * increment the auto_increment property used by fields who's source is set to AUTO.
     * This uses the format specified by the format parameter of the dataset config.
     * @param {String|String[]} bytestreams
     * @returns {{missing_headers: [], records: [], unmapped_headings: [], config: {}}} an array of CAPE records
     */
    generate(bytestreams) {

        let output = {
            config: this.config,
            unmapped_headings: [],
            missing_headers: [],
            records: []
        }

        if (!Array.isArray(bytestreams)) {
            bytestreams = [bytestreams];
        }

        let auto_increment = 0;

        bytestreams.forEach((bytestream) => {
            let incoming_records;

            if (this.format === 'csv') {
                incoming_records = parse(bytestream, {
                    columns: true,
                    skip_empty_lines: true
                });
            } else {
                // TODO
                let tabular_data = xslxToTable(bytestream);
                incoming_records = tableToRecords(tabular_data);
            }

            incoming_records.forEach((incoming_record) => {
                auto_increment++;
                const outgoing_record = this.mapRecord(incoming_record, auto_increment);
                output.records.push(outgoing_record);
            })
        });

        return output;
    }

    mapRecord( incoming_record, auto_increment ) {
        return "fnord";
    }
}


module.exports = Dataset;
