let element = {
    sequenceButton: document.getElementById("get-sequence"),
    sequence: document.getElementById("sequence"),
    formElem: document.getElementById("sequence-form"),
    countListElem: document.getElementById("countList"),
}

let pageSetters = {
    hideStuff() {
        element.sequenceButton.disabled = true;
    },
    showStuff() {
        element.sequenceButton.disabled = false;
    },
}

let sequence = {
    sequenceTypes: ["A", "C", "G", "T"],
    set randomSequence(length) {
        this.length = Math.round(length / 50) * 50
        let seq = "";
        for (let i = 0; i < this.length; i++) {
            seq += this.sequenceTypes[Math.floor(Math.random()*this.sequenceTypes.length)]
        }
        this.seq = seq;
        return seq;
    }
}

let helperFunction = {
    isInt(value) {
        return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
    },
    parseResult(data) {
        let index = -50;
        let updatedLocations = data.map(i => {
            index += 50;
            if (i === undefined) {return [];}
            return i.map(j => {
                let t = parseInt(j.locations) + index;
                return t;
            })
            
        }).flat()
        data.flat().filter(element => element !== undefined).map((curr, index) => {
            return {enzym: curr.enzym, site: curr.site, locations: updatedLocations[index]}
        }).map(enzymes => {
            let entry = document.createElement('li');
            let text = `Enzyme: ${enzymes.enzym}; Site: ${enzymes.site}; Location: ${enzymes.locations}`;
            entry.appendChild(document.createTextNode(text));
            element.countListElem.appendChild(entry);
        });
    },
    checkSequence() {
        pageSetters.hideStuff();
        let number = element.sequence.value;
        if (!helperFunction.isInt(number)) {return;}
        if (number < 1000 | number > 10000) {return;}
        pageSetters.showStuff();
    },
    async submitSequence(e) {
        e.preventDefault();
        let number = element.sequence.value;
        sequence.randomSequence = number;
        const chunkSize = 50
        let urls = []
        for (let i = 0; i < sequence.length; i += chunkSize) {
            urls.push({url: "/api/v3/getcuttingsites", seq: sequence.seq.slice(i, i + chunkSize)})
        }
        const results = await Promise.all(urls.map(async u => {
            const resp = await fetch(u.url, {
                method: 'POST',
                headers: {'Accept': 'application/json, text/plain, */*','Content-Type': 'application/json'},
                body: JSON.stringify({oligo: u.seq})
            });
            if (resp.ok) {
                let data = await resp.json();
                return data;
            }
        }))
        helperFunction.parseResult(results);
    },
}

pageSetters.hideStuff()
document.addEventListener('DOMContentLoaded', function() {
    element.sequence.addEventListener('input', helperFunction.checkSequence);
    element.formElem.addEventListener('submit', helperFunction.submitSequence);
})
