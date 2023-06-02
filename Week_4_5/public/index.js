let element = {
    sequenceButton: document.getElementById("get-sequence"),
    sequence: document.getElementById("sequence"),
    formElem: document.getElementById("sequence-form"),
    countListElem: document.getElementById("countList"),
    tbodyRef: document.getElementById("tableBody")
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
        data.filter(element => element !== undefined)
            .map(enzymes => {
                let seq = enzymes.seq;
                enzymes.data.map(i => {
                    let newRow = element.tbodyRef.insertRow();
                    let cell1 = newRow.insertCell(0);
                    cell1.innerHTML  = seq
                    let cell2 = newRow.insertCell(1);
                    cell2.innerHTML = i.enzym
                    let cell3 = newRow.insertCell(2);
                    cell3.innerHTML = i.site
                    let cell4 = newRow.insertCell(3);
                    cell4.innerHTML = i.locations
                })
            })
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
                return {seq: u.seq, data: data};
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
