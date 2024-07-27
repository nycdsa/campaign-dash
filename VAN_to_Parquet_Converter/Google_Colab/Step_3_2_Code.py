# @title Default title text
FP = "" # @param {type:"string"}
STEM = '/content'

def analyze_file(fp):
    with open(fp, 'r', encoding='UTF-16') as file:
        head = [next(file) for _ in range(10)]
        print(head)

def get_fp(fp):
    PARQUET_EXT = 'parquet.gzip'
    fp_slash_split = fp.split('/')
    file = fp_slash_split[-1]
    file_dot_split = file.split('.')
    file_ext = file_dot_split[-1]
    filename = '.'.join(file_dot_split[:-1])
    file_parquet = '.'.join([filename, PARQUET_EXT])
    fp_parquet = '/'.join([STEM, file_parquet])
    return fp_parquet

if __name__ == "__main__":
    import pandas as pd
    from google.colab import files
    df = pd.read_csv(FP, sep='\t', header=0, encoding='UTF-16')
    df_parquet = get_fp(FP)
    df.to_parquet(df_parquet, compression='gzip')
    files.download(df_parquet)