# undead
A program launcher that retries with exponential backoff when the exit code is non-zero.

## Install
```sh
npm install --global @blackglory/undead
# or
yarn global add @blackglory/undead
```

## Usage
```sh
Usage: undead [options] <commands...>

A program launcher that retries with exponential backoff when the exit code is
non-zero.

Options:
  -V, --version                  output the version number
  --base-timeout <milliseconds>  the base timeout of exponential backoff (default: "1000")
  --max-timeout <milliseconds>   the max timeout of exponential backoff (default: "Infinity")
  --factor <concurrency>         factor (default: "2")
  --no-jitter                    use no-jitter exponential backoff
  -h, --help                     display help for command
```
