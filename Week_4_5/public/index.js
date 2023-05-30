
(async () => {
    // let enzym = "HI"
    // let url = `/api/v3/enzyme/${enzym}`;
    // let response = await fetch(url, {method: "GET"});
    // let result = await response.json();

    let sequence = "ATGATCGTACTACGTACGT";
    let response = await fetch("/api/v3/getcuttingsites"
        , {
            method: 'POST',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({oligo: sequence})
        }
    )
    let result = await response.json();
    console.log(result)
})();
