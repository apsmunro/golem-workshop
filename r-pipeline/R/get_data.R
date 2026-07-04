# Download the open rethinking datasets this phase needs.
base <- "https://raw.githubusercontent.com/rmcelreath/rethinking/master/data"
files <- c("Howell1.csv", "WaffleDivorce.csv", "milk.csv", "rugged.csv", "tulips.csv")
dir.create("data", showWarnings = FALSE)
for (f in files) {
  dest <- file.path("data", f)
  if (!file.exists(dest)) {
    curl::curl_download(file.path(base, f), dest)
    cat("downloaded", f, "\n")
  }
}
