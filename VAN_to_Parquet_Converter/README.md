# Campaign in a Box, VAN-to-Parquet Converter

This is a Python script that processes VAN export files (namely full universe exports) and exports them to files that have better compatability with Google Bigquery.

## How does it work?

The script takes these larger VAN exports and converts them to the Parquet format for faster, easier processing in Google BigQuery. At first glance, VAN's exports appear to be classic XLS files (pre-2007 Excel) due to the .xls file extension. This assumption can cause problems for the enduser when attempting to upload to certain services like BigQuery, where they will be alerted to the fact that the file is not valid. Upon closer inspection it appears, these spreadsheets are in fact simple tab-delimited files that have been mislabeled. As they can be quite big and unwieldy, conversion to the Parquet file format is suitable for rapid data processing. This format is also readily compatible with Google BigQuery.

## What is Parquet?

Parquet is a file format developed by Apache that is optimized for large datasets and data science use cases. In Apache's own words:
> *Parquet is an open source, column-oriented data file format designed for efficient data storage and retrieval. It provides efficient data compression and encoding schemes with enhanced performance to handle complex data in bulk. Parquet is available in multiple languages including Java, C++, Python, etc...*
> From [https://parquet.apache.org/](https://parquet.apache.org/), retrieved 3 March 2024

## How Can I Use This?

This tool is designed to run either as a Google Colab Notebook, or as a standalone local Python script (only advised for advanced users). The code for both use cases is included in this repo.

## Google Colab

### Prerequisites

You need to have a Google account and a Google Drive to run this script in the Google Colab environment. Some basic knowledge of Drive, Python, Jupyter Notebook, and/or Google Colab is recommended.

### Installing

The easiest way to get started is to duplicate our prebuilt Colab Notebook. You can view it [on Google Drive](https://colab.research.google.com/drive/1t7LnJVed8KQfBNWBSjrve04IuaGufgHw?usp=sharing).From here, you can simply click **File** and choose any of the various "Save a copy" options (Drive, GitHub gist, GitHub).

Alternatively, you can use this template as a guide to build your own from source. The files are broken out by steps in the subdirectory "Google_Colab"

## Running the Notebook

Once you've duplicated/built the notebook, follow these steps to run it:

1. Under "Step 1" click the "Browse" button and navigate to where you downloaded the VAN file you wish to convert on your computer. **Important**: This needs to be in the original XLS format.
2. Wait for the upload to finish. Upon completion, the uploaded filename should be under the "Browse" button in **bold**. Highlight and copy it (including the extension). **Don't** copy the part that says "(application/vnd.ms-excel)."
3. Go to "Step 3" and look for a blank labeled "FP" to the right of the Python code. Paste your filename there.
4. Click the play icon (the triange pointing right) on the left margin of the code under Step 3. This executes the code.
5. A save file window will appear. Choose where on your local computer you wish to save the file. The Parquet file will save to that location.

## Local Python Script

### Prerequisites

Strong knowledge and posession of the following open source software is required:
* Python (Preferably 3.11)
* Virtualenv
* Git
* Bash, zsh, or a similar shell

### Installing

#### Clone this repo:
`git clone https://github.com/nycdsa/campaign-field-dash.git`

#### Navigate to this subdirectory
`cd campaign-field-dash/VAN_to_Parquet_Converter"`

#### Spin up a Virtualenv
`python -m venv venv`

#### Activate your Virtualenv (Linux, MacOS, other POSIX)
`. venv/bin/activate`

#### (Windows)
`. venv/Scripts/activate`

#### Install requirements
`pip install -r requirements.txt`

## Running

`python xls_to_parquet.py your_van_export_file.xls`

## Authors

* **Nicola Taylor** - *Campaign in a Box, VAN-to-Parquet Converter* - [NicholasTaylor](https://github.com/NicholasTaylor)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details