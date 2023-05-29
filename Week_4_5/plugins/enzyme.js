const fp = require('fastify-plugin');
const fs = require('fs');
const util = require('util');

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);


function addToExisting(enzyme) {
    let enzymeName = enzyme[0].toUpperCase();
    let site;
    if (enzyme.length == 2) {
        site = enzyme[1];
    } else {
        site = enzyme[2];
    }
    enzymeContainer.enzymes.get(enzymeName).site.push(site);
}

let enzymeContainer = {
    enzymes: new Map(),
    getEnzym(enzym) {
        return this.enzymes.get(enzym);
    },
    addEnzyme(enzyme) {
        let enzymeName = enzyme[0].toUpperCase();
        if (this.enzymes.has(enzymeName)) {
            addToExisting(enzyme)
            return;
        }
        if (enzyme.length == 2) {
            let site = enzyme[1];
            this.enzymes.set(enzymeName, {"site": [site], "synonym": ""});
            return;
        }
        let synonym = enzyme[1];
        let site = enzyme[2];
        this.enzymes.set(enzymeName, {"site": [site], "synonym": synonym});
    },
    set sequence(seq) {
        this.seq = seq;
    },
    getCuttingSites() {
        let result = []
        for (let [enzyme, value] of this.enzymes) {
            let site = value.site.map(s => {
                return s
                    .replace("^", "")
                    .replace(/B/g, "[CGT]")
                    .replace(/D/g, "[AGT]")
                    .replace(/H/g, "[ACT]")
                    .replace(/K/g, "[GT]")
                    .replace(/M/g, "[AC]")
                    .replace(/N/g, "[ACGT]")
                    .replace(/R/g, "[AG]")
                    .replace(/S/g, "[CG]")
                    .replace(/V/g, "[ACG]")
                    .replace(/W/g, "AT")
                    .replace(/Y/g, "[CT]");
            })
            let index = [...this.seq.matchAll(new RegExp(site, 'g'))].map(hit => hit.index);
            if (index.length > 0) {
                result.push({enzym: enzyme, "site": site, "locations": index})
            }
        }
        if (result.length < 1) {
            return {"Oops!": "None found in the database"}
        }
        return result;
    }
}


async function readData(fileName) {
    const data = await readFile(fileName, 'utf8');
    return data;
}

function parseData(data) {
    data
        .split('\n')
        .map(row => row.trim().split(/\s+/))
        .slice(1, -2)
        .forEach(element => {
            if (!(element.length < 2)) {
                enzymeContainer.addEnzyme(element)
            }
        })
}



async function getEnzymeContainer() {
    let data = await readData("./plugins/data/restriction_enzymes_table-rebase.txt");
    parseData(data);
    return enzymeContainer;
}


module.exports = fp(async function (fastify, opts) {
  fastify.decorate('enzymeContainer', getEnzymeContainer)
})