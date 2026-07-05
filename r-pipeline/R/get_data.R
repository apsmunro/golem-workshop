# Download the open rethinking datasets this phase needs.
base <- "https://raw.githubusercontent.com/rmcelreath/rethinking/master/data"
files <- c(
  "Howell1.csv", "WaffleDivorce.csv", "milk.csv", "rugged.csv", "tulips.csv",
  # Phase 4 (ch 11–12): counts, admissions, tools, moral judgments
  "chimpanzees.csv", "UCBadmit.csv", "Kline.csv", "Trolley.csv",
  # Phase 5 (ch 13–14): tadpole tanks (islandsDistMatrix is embedded in code)
  "reedfrogs.csv",
  # Phase 6 (ch 15–16): milk and divorce already present; lynx–hare pelts
  # for the ODE fit (the web overlay embeds the same series)
  "Lynx_Hare.csv"
)
dir.create("data", showWarnings = FALSE)
for (f in files) {
  dest <- file.path("data", f)
  if (!file.exists(dest)) {
    curl::curl_download(file.path(base, f), dest)
    cat("downloaded", f, "\n")
  }
}
