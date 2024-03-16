import "./macros"; // Import the code to be tested

// Test case 1: When isFirstValue is true
var activeSheet = {
  getRange: function(range) {
    return {
      clearContent: function() {
        console.log("Table cleared");
      }
    };
  },
  getLastRow: function() {
    return 10;
  }
};

clearTableIfFirstValue();

// Expected output: "Table cleared"

// Test case 2: When isFirstValue is false
activeSheet = {
  getRange: function(range) {
    return {
      clearContent: function() {
        console.log("Table cleared");
      }
    };
  },
  getLastRow: function() {
    return 5;
  }
};

clearTableIfFirstValue();

// Expected output: No output (table should not be cleared)