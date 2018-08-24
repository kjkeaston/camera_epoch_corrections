const fs = require("fs");
const camera_csv = require("fast-csv");
const nmea_csv = require("fast-csv");

let allCameraCaptures = [];
let allCameraEpoch = [];
let allNmeaEpoch = [];
let epochDiff = []

camera_csv
  .fromPath("test_camera.csv", {headers : true})
  .on("data", data => {
    let cameraRowData = {};
    Object.keys(data).forEach(current_key => {
      cameraRowData[current_key] = parseFloat(data[current_key])
      });
    allCameraCaptures.push(cameraRowData)
    allCameraEpoch.push(cameraRowData.epoch)
  })
  .on("end", () => {
    console.log("Done with Camera CSV import");

    nmea_csv
      .fromPath("test_nmea.csv", {headers : true})
      .on("data", data => {
        let nmeaRowData = {};
        Object.keys(data).forEach(current_key => {
          nmeaRowData[current_key] = parseFloat(data[current_key])
          });
        allNmeaEpoch.push(nmeaRowData.nmea_epoch)
      })
      .on("end", () => {
        console.log("Done with NMEA CSV import");

        for (let i = 0; i < allNmeaEpoch.length; i++) {
          epochDiff.push(allNmeaEpoch[i] - allCameraEpoch[i])
        }

        // Find median of epoch differences
        let median;
        let sortedEpochArr = epochDiff.sort(function(a, b) {return a - b});
        // handle if array of all epochs is an even length >>> i.e. no middle value
        // if no middle value, then find average of the 2 middle floats
        if(sortedEpochArr.length % 2 === 0) {
          let medianLeft = sortedEpochArr[sortedEpochArr.length / 2 - 1];
          let medianRight = sortedEpochArr[sortedEpochArr.length / 2];
          median = (medianLeft + medianRight) / 2;
        } else {
          // if array length is odd, then use middle value of sorted array
          median = sortedEpochArr[Math.floor(sortedEpochArr.length/2)];
        }

        let adjustTime = a => a + median;
        allCameraCaptures = allCameraCaptures.map(eachCapture => ({ ...eachCapture, epoch: adjustTime(eachCapture.epoch) }));

        // Create csv file in current directory
        const ws = fs.createWriteStream("camera_corrected.csv");
        camera_csv
          .write(allCameraCaptures, {headers: true})
          .pipe(ws);
    });
  });
