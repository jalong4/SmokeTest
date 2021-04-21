// Globals
const mSheet = SpreadsheetApp.getActiveSpreadsheet();
const mTestRange = mSheet.getRangeByName('tests');
const mDefaultSheet = "Test plan";
const mSheetName = mSheet.getSheetName();
const mVersionNamedRange = `'${mSheetName}'!version`;
const mFingerprintNamedRange = `'${mSheetName}'!fingerprint`;
const mReleaseTypeNamedRange = `'${mSheetName}'!releaseType`;
const mTestsNamedRange = `'${mSheetName}'!tests`;
const mTestNameHeaderNamedRange = `'${mSheetName}'!testNameHeader`;
const mTestDescriptionHeaderNamedRange = `'${mSheetName}'!testDescriptionHeader`;
const mTestResultHeaderNamedRange = `'${mSheetName}'!testResultHeader`;


function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('TVTS')
    .addItem('Export', 'toJson')
    .addItem('Reset Test Results', 'reset')
    .addItem('Create Test Results', 'setResults')
    .addSeparator()
    .addItem('Help', 'help')
    .addToUi();
}

function help() {
  var helpHtml = HtmlService.createTemplateFromFile('help');
  var htmlOutput = HtmlService.createHtmlOutput(helpHtml.evaluate())
    .setWidth(640)
    .setHeight(360);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Help');
}

function getJSONFilename() {
    var map = {}

    add(map, "Test plan", "smokeTestsResults.json");
    add(map, "SDR Playback Test Cases", "youTubeSdrSmokeTestsResults.json");
    add(map, "HDR Playback Test Cases", "youTubeHdrSmokeTestsResults.json");

    if (!map[mSheetName]) {
      return map[mDefaultSheet][0]
    } else {
      return map[mSheetName][0]
   }
}

function getTestCaseResult(pass, na, review){
// Used for testing
// get reandon test results with propability
// eg. getTtestCaseResult(0.8, 0.1, 0.05) will return
// 80% passed, 10% N/A, 5% Review, 5% Fail

    var rnd = Math.random();

    if (rnd < pass)
      return "Pass";
    else if (rnd < (pass + na))
      return "N/A";
    else if (rnd < (pass + na + review))
      return "Review";
    else
      return "Fail";
}

function add(dictionary, key, value) {
    if (!dictionary[key]) {
        dictionary[key] = [value];
    } else {
        dictionary[key].push(value);
    }
}

function reset() {
  const sheetName = mSheet.getSheetName();
  mSheet.getRangeByName(mReleaseTypeNamedRange).setValue("")
  mSheet.getRangeByName(mFingerprintNamedRange).setValue("<fingerprint>");
  var testResultColumn = getColumnNumberFor(mTestResultHeaderNamedRange);

  for (var row = 1; row <= mTestRange.getNumRows(); row++) {
    mTestRange.getCell(row, testResultColumn).setValue("");
  }
}

function setResults() {
  const testDevice = "Sony/BRAVIA_UR3_UC/BRAVIA_UR3:9/PTT1.190515.001.S97/650421:user/release-keys"
  mSheet.getRangeByName(mReleaseTypeNamedRange).setValue("IR")
  mSheet.getRangeByName(mFingerprintNamedRange).setValue(testDevice);
  var testNameColumn = getColumnNumberFor(mTestNameHeaderNamedRange);
  var testResultColumn = getColumnNumberFor(mTestResultHeaderNamedRange);

  for (var row = 1; row <= mTestRange.getNumRows(); row++) {
    var name = mTestRange.getCell(row, testNameColumn).getValue();
    if (name == null || name == '') {
      continue;
    }
    mTestRange.getCell(row, testResultColumn).setValue(getTestCaseResult(0.9, 0.02, 0.03));
  }
}

function getColumnNumberFor(header) {
  const column = mSheet.getRangeByName(header).getColumn();
  return column;
}

function toJson() {

  var json = {}
  var tests = []

  var releaseTypeRange = mSheet.getRangeByName(mReleaseTypeNamedRange);
  var releaseType = releaseTypeRange.getValue();
  json["releaseType"] = releaseType;

  var version = mSheet.getRangeByName(mVersionNamedRange).getValue();
  json["version"] = version;

  var fingerprint = mSheet.getRangeByName(mFingerprintNamedRange).getValue();
  json["buildFingerPrint"] = fingerprint;

  var startRow = mTestRange.getRow();
  var rows = mTestRange.getNumRows();
  var errors = [];

  if (releaseType === null | releaseType === '') {
    errors.push(`Cell ${releaseTypeRange.getA1Notation()}: Invalid release type`)  
  }

  var testNameColumn = getColumnNumberFor(mTestNameHeaderNamedRange);
  var testDescriptionColumn = getColumnNumberFor(mTestDescriptionHeaderNamedRange);
  var testResultColumn = getColumnNumberFor(mTestResultHeaderNamedRange);


  for (var row = 1; row <= rows; row++) {
    var test = {};

    var name = mTestRange.getCell(row, testNameColumn).getValue();
    var description = mTestRange.getCell(row, testDescriptionColumn).getValue();
    var result = mTestRange.getCell(row, testResultColumn).getValue();

    if (name == null || name == '') {
      continue;
    }

    if (result === null || result === '') {
      errors.push('Row: ' + (row + startRow - 1) + ': Test: ' + name + ' has an invalid test result.')
      continue;
    }

    test['name'] = name;
    test['description'] = description;
    test['result'] = result;
    tests.push(test);

  }

  if (errors.length != 0) {
    SpreadsheetApp.getUi().alert(errors.toString().split(',').join("\n"));
    return null;
  }

  json["tests"] = tests;
  var jsonString = JSON.stringify(json, null, 4);
  var filename = getJSONFilename();

  var html = HtmlService.createHtmlOutputFromFile('export').getContent()
    .replace(/{json}/g, jsonString)
    .replace(/{filename}/g, filename);

  var output = HtmlService.createHtmlOutput(html);
  output.setWidth(800)
  output.setHeight(430);
  SpreadsheetApp.getUi()
      .showModalDialog(output, 'Exported JSON');

}

