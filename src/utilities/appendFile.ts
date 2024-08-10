import fs from 'fs/promises';

// const appendToFile = async (filePath: string, newData: any) => {
//     // Step 1: Read the existing JSON data from the file
//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
//             return;
//         }

//         let olderData;

//         try {
//             // Step 2: Parse the JSON data into a JavaScript object/array
//             olderData = JSON.parse(data);
//         } catch (err) {
//             console.error('Error parsing JSON data:', err);
//             return;
//         }

//         // // Step 3: Modify/add data to the JavaScript object/array
//         // olderData.push(newData);
//         try {

//             // // Check if olderData is an array, if not, handle accordingly
//             // if (Array.isArray(olderData)) {
//             //     // If it's an array, push the new data
//             //     olderData.push(newData);
//             // } else if (typeof olderData === 'object') {
//             //     // If it's an object, convert it to an array and then push
//             //     olderData = [olderData];
//             //     olderData.push(newData);
//             // } else {
//             //     // Handle unexpected structures
//             //     console.error('Unexpected JSON structure:', olderData);
//             //     return;
//             // }

//             Object.assign(olderData, newData);

//             // Step 4: Convert the JavaScript object/array back to JSON format
//             const updatedJsonData = JSON.stringify(olderData, null, 2);

//             // Step 5: Write the updated JSON back to the file
//             fs.writeFile(filePath, updatedJsonData, (err) => {
//                 if (err) {
//                     console.error('Error writing file:', err);
//                     return;
//                 }
//                 console.log('Data appended to', filePath, 'successfully.');
//             });
//             console.log('updatedJsonData', updatedJsonData);

//             // Convert JSON string back to JavaScript object
//             const updatedJsonObject = JSON.parse(updatedJsonData);
//             console.log('updatedJsonObject', updatedJsonObject);
//             return updatedJsonObject;
//         } catch (error) {
//             console.error(error);
//             return;
//         }

//     });
// }

const appendToFile = async (filePath: string, newData: any) => {
    try {
        // Step 1: Read the existing JSON data from the file
        const data = await fs.readFile(filePath, 'utf8');
        let olderData = JSON.parse(data);

        // Step 2: Modify/add data to the JavaScript object/array
        Object.assign(olderData, newData);

        // Step 3: Convert the JavaScript object/array back to JSON format
        const updatedJsonData = JSON.stringify(olderData, null, 2);

        // Step 4: Write the updated JSON back to the file
        await fs.writeFile(filePath, updatedJsonData);

        console.log('Data appended to', filePath, 'successfully.');
        console.log('updatedJsonData', updatedJsonData);

        // Convert JSON string back to JavaScript object
        const updatedJsonObject = JSON.parse(updatedJsonData);
        console.log('updatedJsonObject', updatedJsonObject);

        return updatedJsonObject;
    } catch (error) {
        console.error('Error processing file:', error);
        return null;
    }
};


export default appendToFile;
