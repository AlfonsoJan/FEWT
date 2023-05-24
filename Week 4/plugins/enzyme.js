const fp = require('fastify-plugin');
const fs = require('fs');
const util = require('util');


function addToExisting(enzyme) {
    let enzymeName = enzyme[0];
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
        if (this.enzymes.has(enzyme[0])) {
            addToExisting(enzyme)
            return;
        }
        let enzymeName = enzyme[0];
        if (enzyme.length == 2) {
            let site = enzyme[1];
            this.enzymes.set(enzymeName, {"site": [site], "synonym": ""});
            return;
        }
        let synonym = enzyme[1];
        let site = enzyme[2];
        this.enzymes.set(enzymeName, {"site": [site], "synonym": synonym});
    },
}

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);

async function readData(fileName) {
    const data = await readFile(fileName, 'utf8');
    return data;
}

function parseData(data) {
    data
        .split('\n')
        .map(row => row.split(/\s+/))
        .slice(1)
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