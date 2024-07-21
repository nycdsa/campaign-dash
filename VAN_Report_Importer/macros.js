/* eslint-disable no-undef */
/** @OnlyCurrentDoc */

/** @type {GoogleAppsScript.Spreadsheet.Sheet} */
var activeSheet;

/** @type {GoogleAppsScript.Spreadsheet.Sheet} */
var configSheet;

/** @type {GoogleAppsScript.Spreadsheet.Spreadsheet} */
var spreadsheet;

/** @type {GoogleAppsScript.Drive.Folder} */
var parentFolder;

/** @type {Spreadsheet.Drive.Folder} */
var inputFolder;

/** @type {Spreadsheet.Drive.Folder} */
var outputFolder;

/** @type {Spreadsheet.Drive.Folder} */
var TempFolder;

/** @type {GoogleAppsScript.Spreadsheet.Sheet} */
var dataSheet;

/** @type {String[]} */
var additionalColumns;

/** @type {String[]} */
var header;

/** @type {String[]} */
var fullHeader;

/** @type {boolean} */
var debug = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function processSheet() {
  configSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Configuration");
  additionalColumns = ["Instance of VANID", "Filename", "Date/Time Added"];

  if (!debug) {
    activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  } else {
    activeSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Add Survey Data");
  }
  setup();
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  parentFolder = DriveApp.getFileById(spreadsheet.getId()).getParents().next();
  var outputFolderName;
  var outputFileName;
  var folderName;
  var dataSheetName;
  var headerName;
  if (activeSheet.getName() == "Add Survey Data") {
    folderName = configSheet.getRange("B3").getValue();
    dataSheetName = configSheet.getRange("C3").getValue();
    headerName = configSheet.getRange("D3").getValue();
    outputFileName = configSheet.getRange("E3").getValue();
    outputFolderName = configSheet.getRange("F3").getValue();
  } else {
    folderName = configSheet.getRange("B4").getValue();
    dataSheetName = configSheet.getRange("C4").getValue();
    headerName = configSheet.getRange("D4").getValue();
    outputFileName = configSheet.getRange("E4").getValue();
    outputFolderName = configSheet.getRange("F4").getValue();
  }
  header = Utilities.parseCsv(preprocessCsvData(headerName))[0]; //.replace(/\n/g, "").trim();
  Logger.log(header);
  TempFolder = setupFiles("TempFolder");
  fullHeader = header.concat(additionalColumns);
  inputFolder = setupFiles(folderName);
  outputFolder = setupFiles(outputFolderName);
  dataSheet = setupSheet(outputFolder, outputFileName, dataSheetName);
  processCSVFilesInZip(dataSheet, inputFolder);
  var numberOfDuplicates = cleanupSheet();
  sortSummaryandUpdateCounts(numberOfDuplicates);
  showDoneMessage();

  function preprocessCsvData(csvData) {
    // Remove leading and trailing whitespace from each line
    var lines = csvData.split(",");
    lines = lines.map((line) => line.trim());

    // Join the lines back together
    var preprocessedCsvData = lines.join(",").replace(/\n/g, " ");

    return preprocessedCsvData;
  }
}

function countIf(valuesArray) {
  // Convert startRow to zero-based index

  var returnArray = [];
  // Get the value to compare from the startRow position
  var valueToCompare = valuesArray[0];
  returnArray[0] = 1;

  // Count occurrences of valueToCompare in the array up to the startRow position (inclusive)
  let count = 0;
  for (let i = 1; i < valuesArray.length; i++) {
    if (valuesArray[i] === valueToCompare) {
      count++;
    }
    returnArray[i] = count;
    valueToCompare = valuesArray[i];
  }

  return returnArray;
}

function bindMultipleRows(...arrays) {
  // Use the reduce method to concatenate all the arrays row-wise
  return arrays.reduce((acc, array) => acc.concat(array), []);
}

const arrayColumn = (arr, n) => arr.map((x) => x[n]);

function concatArraysByColumns(...arrays) {
  // Determine the number of rows and validate the arrays
  const numRows = arrays[0].length;

  for (let arr of arrays) {
    if (arr.length !== numRows) {
      throw new Error("All arrays must have the same length.");
    }
  }

  // Initialize the result array
  const result = Array.from({ length: numRows }, () => []);

  // Concatenate columns
  for (let arr of arrays) {
    for (let i = 0; i < numRows; i++) {
      if (Array.isArray(arr[i])) {
        result[i] = result[i].concat(arr[i]);
      } else {
        result[i].push(arr[i]);
      }
    }
  }

  return result;
}
function compareArrays(rangeArray, stringArray) {
  if (rangeArray.length !== stringArray.length) {
    return false;
  }

  return rangeArray.every((row, index) => {
    var isEqual = row.toString() === stringArray[index].toString();
    return isEqual;
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
/**
 *
 *
 * @return {number}
 */
function cleanupSheet() {
  var myArray;
  if (activeSheet.getName() != "Add Survey Data") {
    if (
      fullHeader.indexOf("Voter File VANID") == -1 ||
      fullHeader.indexOf("Date Canvassed") == -1 ||
      fullHeader.indexOf("Result") == -1 ||
      fullHeader.indexOf("Contact Type") == -1
    ) {
      throw new Error(
        "Header is missing one or more of the following columns: Result, Contact Type, Date Canvassed, Voter File VANID"
      );
    }
    myArray = [
      fullHeader.indexOf("Voter File VANID") + 1,
      fullHeader.indexOf("Date Canvassed") + 1,
      fullHeader.indexOf("Result") + 1,
      fullHeader.indexOf("Contact Type") + 1,
    ];
  } else {
    if (
      fullHeader.indexOf("Voter File VANID") == -1 ||
      fullHeader.indexOf("Date Canvassed") == -1 ||
      fullHeader.indexOf("Survey Response") == -1 ||
      fullHeader.indexOf("Contact Type") == -1
    ) {
      throw new Error(
        "Header is missing one or more of the following columns: Survey Response, Contact Type, Date Canvassed, Voter File VANID"
      );
    }
    myArray = [
      fullHeader.indexOf("Voter File VANID") + 1,
      fullHeader.indexOf("Date Canvassed") + 1,
      fullHeader.indexOf("Survey Response") + 1,
      fullHeader.indexOf("Contact Type") + 1,
    ];
  }

  var lastRow = dataSheet.getLastRow();

  // Check if there is at least one row of data
  if (lastRow <= 1) {
    // No data, you can handle this case as needed
    Logger.log("No data in the range. Skipping cleanup.");
    return;
  }

  //Voter File VANID,Date Canvassed,Survey Response,Contact Type
  var dataRange = dataSheet.getRange(2, 1, lastRow - 1, fullHeader.length);

  var dateCanvassedIndex = fullHeader.indexOf("Date Canvassed") + 1;
  if (dateCanvassedIndex !== -1) {
    // Sort the data
    dataRange.sort(dateCanvassedIndex);
  }
  // Remove duplicates
  dataRange.removeDuplicates(myArray);

  return (numberOfDuplicates = lastRow - dataSheet.getLastRow());

  /**
   *
   *
   * @param {number} length
   * @return {Array}
   */
}

/**
 *
 *
 * @param {Number} numberOfDuplicates
 * @paramm {Number} total
 */
function sortSummaryandUpdateCounts(numberOfDuplicates) {
  var dataRange = activeSheet.getRange(4, 3, activeSheet.getLastRow() - 3, 6);
  dataRange.sort(4);
  activeSheet.getRange(5, 11).setValue(numberOfDuplicates);
  total = activeSheet.getRange(4, 11).getValue();
  activeSheet.getRange(6, 11).setValue(numberOfDuplicates / total);
}

function showPleaseWait() {
  var cell = activeSheet.getRange("A1"); // Adjust the cell as per your preference
  cell.setValue("Please wait...");

  // Enhance text visibility and disable text wrapping
  cell.setFontSize(14).setFontWeight("bold").setFontColor("red");
  cell.setHorizontalAlignment("center").setVerticalAlignment("middle");
  cell.setWrap(false);
}

function updateProgress(processedXLSFiles, totalXLSFiles) {
  var cell = activeSheet.getRange("B1"); // Adjust the cell as per your preference

  var progressPercentage = Math.round(
    (processedXLSFiles / totalXLSFiles) * 100
  );
  cell.setValue("Progress: " + progressPercentage + "%"); // Displaying progress percentage in cell B1

  // Enhance text visibility and disable text wrapping
  cell.setFontSize(12).setFontWeight("bold").setFontColor("green");
  cell.setHorizontalAlignment("center").setVerticalAlignment("middle");
  cell.setWrap(false);
}
function showDoneMessage() {
  var cell = activeSheet.getRange("A1"); // Same cell as the "Please wait..." message
  cell.setValue("Task Completed!");

  // Enhance text visibility and disable text wrapping
  cell.setFontSize(14).setFontWeight("bold").setFontColor("blue");
  cell.setHorizontalAlignment("center").setVerticalAlignment("middle");
  cell.setWrap(false);
}

function clearProgress() {
  var progressCell = activeSheet.getRange("B1"); // Assuming progress is displayed in cell B1
  var doneCell = activeSheet.getRange("A1"); // Assuming "done" message is displayed in cell C1

  progressCell.clearContent(); // Clear progress
  doneCell.clearContent(); // Clear "done" message
}

function setup() {
  activeSheet.getRange("K6").clearContent();
  activeSheet.getRange("K5").clearContent();
  clearTableIfFirstValue();
  clearProgress();
  showPleaseWait();
}
/**
 *
 *
 * @param {GoogleAppsScript.Drive.Folder} parentFolder
 * @param {*} outputFileName
 * @param {*} sheetName
 * @return {*}
 */
function setupSheet(outputFolder, outputFileName, sheetName) {
  var workbook = null;
  var files = outputFolder.getFilesByName(outputFileName);
  if (files.hasNext()) {
    // Workbook already exists, assign it to a variable
    Logger.log("Workbook already exists");
    workbook = SpreadsheetApp.open(files.next());
  } else {
    workbook = SpreadsheetApp.create(outputFileName);
    tmp = DriveApp.getFileById(workbook.getId());
    tmp.moveTo(outputFolder);
  }
  var dataSheet = workbook.getSheetByName(sheetName);

  if (dataSheet != null) {
    // Sheet already exists, assign it to a variable
    Logger.log("Sheet already exists");
    dataSheet.clearContents();
  } else {
    // Sheet does not exist, create it and assign it to a variable
    Logger.log("Sheet does not exist");
    dataSheet = workbook.insertSheet(sheetName);
  }

  Logger.log(fullHeader);
  Logger.log("Parent Folder: " + outputFolder);
  Logger.log("Output File Name: " + outputFileName);
  Logger.log("Sheet Name: " + sheetName);
  dataSheet.getRange(1, 1, 1, fullHeader.length).setValues([fullHeader]);

  Logger.log("Setup sheet completed");

  return dataSheet;
}

/**
 * Sets up the necessary files and folders for the import process.
 */
function setupFiles(folderName) {
  // Get the active spreadsheet and its parent folder
  var folderIterator = parentFolder.getFoldersByName(folderName);
  var folder;
  if (!folderIterator.hasNext()) {
    folder = parentFolder.createFolder(folderName);
    // eslint-disable-next-line no-undef
    Logger.log(folderName + " folder created.");
  } else {
    folder = folderIterator.next();
    Logger.log(folderName + " folder already exists.");
  }
  return folder;
}

/**
 * Processes CSV files within a ZIP folder.
 *
 * @param {Sheet} sheet - The sheet to write the output to.
 * @param {GoogleAppsScript.Drive.Folder} folder - The folder containing the ZIP files.
 * @param {string} output - The output destination.
 */
function processCSVFilesInZip(sheet, folder) {
  var filesIterator = folder.getFiles();
  var files = [];
  while (filesIterator.hasNext()) {
    files.push(filesIterator.next());
  }
  var data;
  for (var j = 0; j < files.length; j++) {
    // Update progress after each ZIP file processed
    updateProgress(j, files.length - 1);
    var file = files[j];
    var fileName = file.getName();

    if (fileName.endsWith(".zip")) {
      var zipBlob = file.getBlob();
      zipBlob.setContentTypeFromExtension();
      var zip = Utilities.unzip(zipBlob);

      // Process the ZIP file contents here
      Logger.log("Processing ZIP file: " + fileName);
      try {
        var innerFile = zip[0];
        var innerFileName = innerFile.getName();

        // Handle specific file types within the ZIP (e.g., XLSX)
        if (innerFileName.endsWith(".xls")) {
          Logger.log("Processing file within ZIP: " + innerFileName);
          var temp;

          // Perform operations on the XLS file
          try {
            temp = processCSVData(file, innerFile);
            data = bindMultipleRows(data, temp);
          } catch (e) {
            temp = null;
            addRowsToTable(fileName, null, null, null, e);
          }
        } else {
          throw new Error(
            "Invalid file type: " + innerFileName + " in " + fileName
          );
        }
      } catch (e) {
        addRowsToTable(fileName, null, null, null, e);
      }
    }
  }
  sheet.getActiveSheet().setValues(data);
}
/**
 *
 *
 * @param {any[][]} sheet
 * @param {GoogleAppsScript.Base.Blob} csvBlob
 * @param {GoogleAppsScript.Spreadsheet.Sheet} outputSheet
 * @param {string} filename
 * @param {boolean} reset
 */
function processCSVData(file, csvBlob) {
  var csvData = null;
  var files = TempFolder.getFilesByName(file.getId());
  if (files.hasNext()) {
    // Workbook already exists, assign it to a variable
    csvData = SpreadsheetApp.open(files.next())
      .getActiveSheet()
      .getDataRange()
      .getValues();
  } else {
    var config = {
      name: file.getId(),
      parents: [TempFolder.getId()],
      mimeType: MimeType.GOOGLE_SHEETS,
    };
    var newFile = Drive.Files.create(config, csvBlob, {
      supportsAllDrives: true,
    });
    csvData = SpreadsheetApp.openById(newFile.id)
      .getActiveSheet()
      .getDataRange()
      .getValues();
  }

  // Get the header values
  var hdr = csvData[0];

  //DriveApp.getFileById(newFile.id).setTrashed(true);

  if (!compareArrays(hdr, header)) {
    throw new Error(
      "Header does not align with expected output, please check file"
    );
  } else {
    csvData = csvData.slice(1);
    var dateColumnIndex = hdr.indexOf("Date Canvassed");
    if (dateColumnIndex < 0) {
      throw new Error("Column 'Date Canvassed' not found");
    }

    var dateValues = csvData.map((row) => {
      return new Date(row[dateColumnIndex]);
    });

    var maxRange = Utilities.formatDate(
      new Date(Math.max.apply(null, dateValues)),
      "America/New_York",
      "MM/dd/yyyy"
    );
    var minRange = Utilities.formatDate(
      new Date(Math.min.apply(null, dateValues)),
      "America/New_York",
      "MM/dd/yyyy"
    );

    addRowsToTable(file.getName(), minRange, maxRange, csvData.length, "OK");

    Logger.log(
      "File " +
        file.getName() +
        ", starts on " +
        minRange +
        " and ends on " +
        maxRange
    );
    // Append the imported data to the existing or new sheet

    //var startRow = sheet.length+ 1;
    var filenameArray = Array(csvData.length).fill([file.getName()]);
    var dateTimeCol = Array(csvData.length).fill([
      Utilities.formatDate(new Date(), "America/New_York", "MM/dd/yyyy h:mm a"),
    ]);
    var result = countIf(
      arrayColumn(csvData, hdr.indexOf("Instance of VANID"))
    );

    return concatArraysByColumns(csvData, result, filenameArray, dateTimeCol);
  }
}
/**
 *
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} startColumn
 * @param {number} endColumn
 * @return {number}
 */
function getLastRowInRange(sheet, startColumn, endColumn) {
  var data = sheet
    .getRange(startColumn + "2:" + endColumn + sheet.getLastRow())
    .getValues();
  for (var i = data.length - 1; i >= 0; i--) {
    var row = data[i];
    if (
      row.some(function (cell) {
        return cell !== "";
      })
    ) {
      return i + 2; // Adding 2 to account for 1-based indexing and header row
    }
  }
  return 1; // If the range is completely empty, return 1 as the first row.
}

/**
 *
 *
 * @param {String} filename
 * @param {Number} min
 * @param {Number} max
 * @param {Number} numRowsProcessed
 * @param {String} statusColumn
 * @param {boolean} isFirstValue
 */
function addRowsToTable(filename, min, max, numRowsProcessed, statusColumn) {
  // Get the last row in the specified range
  var lastRow = getLastRowInRange(activeSheet, "C", "H");

  // Calculate the next row number
  var nextRow = lastRow + 1;

  // Get the current timestamp
  var timestamp = Utilities.formatDate(
    new Date(),
    "America/New_York",
    "MM/dd/yyyy hh:mm:ss aa"
  ); //Utilities.formatDate(new Date(),"America/New_York", "MM/dd/yyyy")

  // Create an array with the data to add to the table
  var rowData = [filename, min, max, numRowsProcessed, statusColumn, timestamp];

  // Set the values in the next row of the specified range
  activeSheet.getRange(nextRow, 3, 1, 6).setValues([rowData]);
}

function clearTableIfFirstValue() {
  var range = activeSheet.getRange("C3:H" + activeSheet.getLastRow());

  // If isFirstValue is true, clear the table within the range
  range.clearContent();
  activeSheet
    .getRange(3, 3, 1, 6)
    .setValues([
      [
        "File Name",
        "First Date",
        "Last Date",
        "# Records",
        "Error Notes",
        "Timestamp",
      ],
    ]);
}
