# Export fitted models as golem-workshop/posterior@1 artifacts.
# Refuses to export any fit failing rhat < 1.01 or bulk-ESS > 400.
library(posterior)
library(jsonlite)

`%||%` <- function(a, b) if (is.null(a)) b else a

OUT <- "../web/public/data/posteriors"
dir.create(OUT, recursive = TRUE, showWarnings = FALSE)
N_DRAWS <- 2000

# course-facing parameter names per model
param_maps <- list(
  "m4.1" = c(mu = "b_Intercept", sigma = "sigma"),
  "m4.3" = c(a = "b_Intercept", b = "b_weight_c", sigma = "sigma"),
  "m5.1" = c(a = "b_Intercept", bA = "b_A", sigma = "sigma"),
  "m5.2" = c(a = "b_Intercept", bM = "b_M", sigma = "sigma"),
  "m5.3" = c(a = "b_Intercept", bM = "b_M", bA = "b_A", sigma = "sigma"),
  "m5.7" = c(a = "b_Intercept", bN = "b_N", bM = "b_M", sigma = "sigma"),
  "m8.1" = c(a = "b_Intercept", b = "b_rugged_std_c", sigma = "sigma"),
  "m8.2" = c(a1 = "b_cid1", a2 = "b_cid2", b = "b_rugged_std_c", sigma = "sigma"),
  "m8.3" = c(a1 = "b_cid1", a2 = "b_cid2",
             b1 = "b_cid1:rugged_std_c", b2 = "b_cid2:rugged_std_c",
             sigma = "sigma"),
  "m8.4" = c(a = "b_Intercept", bW = "b_water_c", bS = "b_shade_c",
             sigma = "sigma"),
  "m8.5" = c(a = "b_Intercept", bW = "b_water_c", bS = "b_shade_c",
             bWS = "b_water_c:shade_c", sigma = "sigma"),
  "m9.1" = c(a1 = "b_cid1", a2 = "b_cid2",
             b1 = "b_cid1:rugged_std_c", b2 = "b_cid2:rugged_std_c",
             sigma = "sigma")
)

chapters <- c("m4.1" = 4, "m4.3" = 4, "m5.1" = 5, "m5.2" = 5,
              "m5.3" = 5, "m5.7" = 5,
              "m8.1" = 8, "m8.2" = 8, "m8.3" = 8, "m8.4" = 8,
              "m8.5" = 8, "m9.1" = 9)

for (model in names(param_maps)) {
  path <- file.path("fits", paste0(model, ".rds"))
  if (!file.exists(path)) {
    cat("skip", model, "- not fitted\n")
    next
  }
  fit <- readRDS(path)
  draws <- as_draws_df(fit)
  map <- param_maps[[model]]

  diagnostics <- list()
  out_draws <- list()
  for (course_name in names(map)) {
    internal <- map[[course_name]]
    col <- draws[[internal]]
    stopifnot(!is.null(col))
    rhat_v <- rhat(extract_variable_matrix(fit, internal))
    ess_v <- ess_bulk(extract_variable_matrix(fit, internal))
    if (rhat_v >= 1.01 || ess_v <= 400) {
      stop(sprintf("%s %s fails gates: rhat %.4f ess %.0f",
                   model, course_name, rhat_v, ess_v))
    }
    diagnostics[[course_name]] <- list(rhat = rhat_v, ess_bulk = ess_v)
    idx <- round(seq(1, length(col), length.out = N_DRAWS))
    out_draws[[course_name]] <- col[idx]
  }

  artifact <- list(
    schema = "golem-workshop/posterior@1",
    model = model,
    chapter = chapters[[model]],
    seed = 1959,
    engine = "brms",
    created = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
    data = list(name = attr(fit$data, "data_name") %||% "", n = nrow(fit$data)),
    params = names(map),
    draws = out_draws,
    diagnostics = diagnostics
  )
  write_json(artifact, file.path(OUT, paste0(model, ".json")),
             auto_unbox = TRUE, digits = 6)
  cat("exported", model, "\n")
}

# --- Chapter 7 comparison artifact: divorce trio, LOO + WAIC -----------
trio <- c("m5.1", "m5.2", "m5.3")
paths <- file.path("fits", paste0(trio, ".rds"))
if (all(file.exists(paths))) {
  fits <- lapply(paths, readRDS)
  names(fits) <- trio
  if (all(vapply(fits, function(f) !is.null(f$criteria$loo), logical(1)))) {
    rows <- lapply(trio, function(name) {
      l <- fits[[name]]$criteria$loo$estimates
      w <- fits[[name]]$criteria$waic$estimates
      list(
        model = name,
        elpd_loo = l["elpd_loo", "Estimate"],
        se_elpd_loo = l["elpd_loo", "SE"],
        p_loo = l["p_loo", "Estimate"],
        looic = l["looic", "Estimate"],
        waic = w["waic", "Estimate"]
      )
    })
    comparison <- list(
      schema = "golem-workshop/comparison@1",
      chapter = 7,
      seed = 1959,
      engine = "brms",
      created = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
      models = rows
    )
    write_json(comparison, file.path(OUT, "comparison-ch07.json"),
               auto_unbox = TRUE, digits = 4)
    cat("exported comparison-ch07\n")
  } else {
    cat("skip comparison-ch07 - criteria missing (run fit_models.R)\n")
  }
} else {
  cat("skip comparison-ch07 - divorce fits missing\n")
}
