# One-time environment setup for the r-pipeline. Validated on Windows
# (R 4.5.0 + RTools45), session 010.
# cmdstanr is not on CRAN — it resolves from the Stan R-universe repo,
# which must be in repos() or the install fails.
options(repos = c(
  stan = "https://stan-dev.r-universe.dev",
  CRAN = "https://cloud.r-project.org"
))
install.packages(
  c("brms", "cmdstanr", "posterior", "loo", "jsonlite", "curl"),
  type = "binary"
)

# cmdstan itself needs a C++ toolchain (RTools on Windows). The check
# names anything missing and fixes what it can; the install compiles
# cmdstan (~15 min).
cmdstanr::check_cmdstan_toolchain(fix = TRUE)
cmdstanr::install_cmdstan(cores = 4)
cat("Setup complete. Next: make data && make fits && make export\n")
