# One-time environment setup. Installs renv and the locked toolchain.
if (!requireNamespace("renv", quietly = TRUE)) install.packages("renv")
renv::init(bare = TRUE)
renv::install(c(
  "brms",
  "cmdstanr@0.8.1",
  "posterior",
  "jsonlite",
  "curl"
))
renv::snapshot()
cat("Now run: Rscript -e 'cmdstanr::install_cmdstan()'\n")
