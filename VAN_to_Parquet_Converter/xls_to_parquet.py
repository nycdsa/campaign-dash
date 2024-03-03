import pandas as pd
import sys


def analyze_file(fp):
    with open(fp, "r", encoding="UTF-16") as file:
        head = [next(file) for _ in range(10)]
        print(head)


def get_fp(fp):
    PARQUET_EXT = "parquet.gzip"
    fp_slash_split = fp.split("/")
    file = fp_slash_split[-1]
    stem = "/".join(fp_slash_split[:-1])
    file_dot_split = file.split(".")
    filename = ".".join(file_dot_split[:-1])
    file_parquet = ".".join([filename, PARQUET_EXT])
    fp_parquet = "/".join([stem, file_parquet])
    return fp_parquet


if __name__ == "__main__":
    fp = sys.argv[1]
    df = pd.read_csv(fp, sep="\t", header=0, encoding="UTF-16")
    df_parquet = get_fp(fp)
    df.to_parquet(df_parquet, compression="gzip")
    pd.read_parquet(df_parquet)
