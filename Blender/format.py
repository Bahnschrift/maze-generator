import os


files = [*filter(lambda x: x.endswith(".py"), os.listdir())]
print("Formatting:\n-- ", "\n-- ".join(files))
if input("To cancel enter N: ").lower() != "n":
    for file in files:
        os.system(f"black {file} --line-length 80")
