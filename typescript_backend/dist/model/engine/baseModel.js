export function find(model, query) {
    return new Promise((resolve, reject) => {
        if (query) {
            model.find(query)
                .then(data => {
                resolve(data); // Resolve with the queried data
            })
                .catch(error => {
                reject({ "Error": "Getting query from database", "Details": error.message }); // Reject with the error details
            });
        }
        else {
            reject({ "Error": "Query is empty" }); // Reject if query is not provided
        }
    });
}
