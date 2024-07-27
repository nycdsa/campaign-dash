# Campaign in a Box, VAN Report Importer

This is a Google Apps Script project that processes CSV files within ZIP files in a specified Google Drive folder.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have a Google account to run this script in the Google Apps Script environment. 

### Installing

The easiest way to get started is to copy our prebuilt template. This template already contains the necessary scripts, so it's ready to use right away. You can find a link to this template in the "Using prebuilt template" section of this document.

If you want to install the macro in a different Google Sheet, follow these steps:

1. Open the Google Sheet where you want to install the macro. Please note that the structure of this sheet needs to match a specific template for the macro to work correctly.
2. Navigate to the menu bar at the top of the Google Sheets interface. Click on `Extensions`, then select `Apps Script`. This will open the Google Apps Script Editor in a new tab.
3. In the Apps Script Editor, you might see some default code. If so, select all of it and press `Delete` to remove it.
4. Open the `macros.js` file in a text editor. Select all the code and copy it.
5. Go back to the Apps Script Editor. Click inside the code editor area, then press `Ctrl+V` or `Cmd+V` to paste the copied code.
6. After pasting the code, navigate to the menu bar at the top of the Apps Script Editor. Click on `File`, then select `Save`.
7. A dialog box will appear asking you to name the project. Enter your desired name, then click `OK`.

After following these steps, the macro is now installed in your Google Sheet and ready to use. Remember to use the prebuilt template for the macro to function correctly.

## Running the script

To run the script, follow these steps:

1. Go to the "Add Survey Data" or "Add Contact Data" sheet in your Google Spreadsheet.
2. Click on the button associated with the function you want to run. This is the recommended way to run the script.

Alternatively, you can also run the script from the Apps Script Editor, but you must be in the "Add Contact Data" or "Add Survey Data" active sheet for it to work:

1. Select the function you want to run from the select function dropdown.
2. Click on the play icon to run the function.

## Built With

* [Google Apps Script](https://developers.google.com/apps-script) - The scripting language used

## Authors

* **Sebastian Caceres** - *Campaign in a Box, VAN Report Importer* - [SebastianCaceres](https://github.com/SebastianCaceres/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Using the Prebuilt Spreadsheet

If you want to get started quickly, you can use our prebuilt Google Spreadsheet. You can find it at the following link: [Prebuilt Spreadsheet](https://docs.google.com/spreadsheets/d/1ZO4C2JnS4Z-QF5EEXGjZcA6inW1ZOpqtoqtByZeuCc4/edit?usp=drive_link).

Please note that you need to have a Google account to use this feature.

If you need access to the template, please contact Nick or Dave Mahler.

## Configuration Sheet

The Configuration sheet is a crucial part of the script. It is used to store and retrieve various configuration parameters that the script uses to process the data.

The Configuration sheet is expected to have the following structure:

- The third column contains the names of the folders where the script will look for files to process.
- The fourth column contains the names of the data sheets where the script will write the processed data.
- The fifth column contains the header names that the script will use when processing the data.

The script reads these values from either the third or fourth row of the Configuration sheet, depending on the name of the active sheet. If the active sheet's name is "Add Survey Data", the script reads the values from the third row. Otherwise, it reads the values from the fourth row.

Please ensure that the Configuration sheet is properly set up with the correct values in these cells before running the script.

## File Setup

When you run the script, it checks if a specific folder exists in the same location as your Google Spreadsheet. If the folder doesn't exist, the script will create it for you. This folder is where you should place any ZIP files that you want the script to process. Once the ZIP files are in this folder, the script can read and process them accordingly.

## Script Functionality

When you run this script on a Google Spreadsheet, it performs several operations:

1. It reads certain information from the first row of the active sheet.
2. It prepares the active sheet and a specific folder for data processing.
3. It processes CSV files within ZIP files located in the specified folder.
4. It removes any duplicate data from the sheet.
5. It sorts a summary and updates counts based on the number of duplicates.
6. Finally, it shows a message indicating that the processing is done.

## Security and Permissions

The first time you run the script, Google will ask you to trust the script and give it access to your Google Drive. This is necessary for the script to read and write files. Check the "Granting Permissions" section for detailed steps on how to do this.

Please consider the following security considerations:

1. **Use a dedicated Google account**: To minimize the risk of exposing personal data, consider using a dedicated Google account for running this script instead of your personal account.

2. **Limit sharing**: Only share the Google Spreadsheet with people who need access to it. Anyone with access can potentially run the script.

3. **Review the script**: Before running the script, review it to ensure you understand what it does. Never run scripts from sources you do not trust.

Remember, by running the script, you are responsible for any changes it makes to your Google Drive.

### Granting Permissions

The first time you run the script, Google will ask you to trust the script and give it access to your Google Drive. This is necessary for the script to read and write files. Here are the steps you'll need to follow:

1. After clicking on the button to run the script, a dialog box will appear. This is Google's Authorization screen.
2. Click on the `Continue` button in the dialog box.
3. You'll be redirected to a new page. Here, you'll need to select your Google account.
4. After selecting your account, you'll see a screen that lists the permissions the script is requesting. Review these permissions to ensure you're comfortable granting them.
5. If you agree to the permissions, click on the `Allow` button.
6. You'll be redirected back to your Google Sheet, and the script will run.

Remember, by running the script, you are responsible for any changes it makes to your Google Drive.


