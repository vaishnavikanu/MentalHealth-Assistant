import pandas as pd

df = pd.read_csv(
    "evaluation/results/predictions.csv"
)

print()

print(df.describe())

print()

print(df[

    [

        "em",

        "f1",

        "rougeL",

        "latency_ms",

    ]

].mean())