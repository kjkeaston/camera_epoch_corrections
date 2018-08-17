const csv = require("fast-csv");
const fs = require("fs");

// Select number of seconds to adjust camera epoch
// Use a negative to reduce epoch by n-seconds
const numOfSecondsToAdjust = 1

// Select a number of decimal places to round camera epoch time
// Use 0 to not have any decimals
const numOfEpochDecimals = 3

let allCameraCaptures = [];

csv
  .fromPath("test_camera.csv", {headers : true})
  .on("data", data => {
    let cameraRowData = {};
    Object.keys(data).forEach(current_key => {
      cameraRowData[current_key] = parseFloat(data[current_key])
      });
    allCameraCaptures.push(cameraRowData)
  })
  .on("end", () => {
    console.log("Done with CSV import");

    let adjustTime = a => a + numOfSecondsToAdjust;

    allCameraCaptures = allCameraCaptures.map(eachCapture => ({ ...eachCapture, epoch: adjustTime(parseFloat(eachCapture.epoch.toFixed(numOfEpochDecimals))) }));

    // Create csv file in current directory
    const ws = fs.createWriteStream("camera_corrected.csv");
    csv
      .write(allCameraCaptures, {headers: true})
      .pipe(ws);
 });
