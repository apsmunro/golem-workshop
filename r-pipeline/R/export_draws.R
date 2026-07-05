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
             sigma = "sigma"),
  # Chapter 11: binomial and Poisson GLMs
  "m11.4" = c(a1 = "b_actor1", a2 = "b_actor2", a3 = "b_actor3",
              a4 = "b_actor4", a5 = "b_actor5", a6 = "b_actor6",
              a7 = "b_actor7", b2 = "b_treatment2", b3 = "b_treatment3",
              b4 = "b_treatment4"),
  "m11.7" = c(aM = "b_gidmale", aF = "b_gidfemale"),
  "m11.8" = c(aM = "b_gidmale", aF = "b_gidfemale",
              dB = "b_deptB", dC = "b_deptC", dD = "b_deptD",
              dE = "b_deptE", dF = "b_deptF"),
  "m11.10" = c(aLow = "b_contact_idlow", aHigh = "b_contact_idhigh",
               bLow = "b_contact_idlow:P", bHigh = "b_contact_idhigh:P"),
  # Chapter 12: mixtures and ordered categories
  "m12.1" = c(aM = "b_gidmale", aF = "b_gidfemale", phi = "phi"),
  "m12.3" = c(al = "b_Intercept", ap = "b_zi_Intercept"),
  "m12.4" = c(c1 = "b_Intercept[1]", c2 = "b_Intercept[2]",
              c3 = "b_Intercept[3]", c4 = "b_Intercept[4]",
              c5 = "b_Intercept[5]", c6 = "b_Intercept[6]"),
  "m12.5" = c(bA = "b_action", bC = "b_contact", bI = "b_intention",
              bIA = "b_action:intention", bIC = "b_contact:intention"),
  # Chapter 13: multilevel hyperparameters
  "m13.2" = c(a_bar = "b_Intercept", sigma_tank = "sd_tank__Intercept"),
  "m13.4" = c(a_bar = "b_Intercept",
              b2 = "b_treatment2", b3 = "b_treatment3", b4 = "b_treatment4",
              sigma_actor = "sd_actor__Intercept",
              sigma_block = "sd_block__Intercept"),
  # Chapter 14: covariance and Gaussian process
  "m14.1" = c(a_bar = "b_Intercept", b_bar = "b_afternoon",
              sigma_a = "sd_cafe__Intercept", sigma_b = "sd_cafe__afternoon",
              rho = "cor_cafe__Intercept__afternoon", sigma = "sigma"),
  "m14.8" = c(a = "b_Intercept", sdgp = "sdgp_gplon2lat2",
              lscale = "lscale_gplon2lat2"),
  # Chapter 15: measurement error (the error-corrected coefficients)
  "m15.1" = c(a = "b_Intercept", bA = "b_A2", bM = "b_M2", sigma = "sigma"),
  # Chapter 16: the cylinder model's fitted constant and shape ratio.
  # m15.5 (imputation) and m16.5 (ODE) are fit but not auto-exported —
  # their internal parameter names are non-standard; the web interactives
  # run on the JS engines.
  "m16.1" = c(k = "b_k_Intercept", p = "b_p_Intercept", sigma = "sigma")
)

chapters <- c("m4.1" = 4, "m4.3" = 4, "m5.1" = 5, "m5.2" = 5,
              "m5.3" = 5, "m5.7" = 5,
              "m8.1" = 8, "m8.2" = 8, "m8.3" = 8, "m8.4" = 8,
              "m8.5" = 8, "m9.1" = 9,
              "m11.4" = 11, "m11.7" = 11, "m11.8" = 11, "m11.10" = 11,
              "m12.1" = 12, "m12.3" = 12, "m12.4" = 12, "m12.5" = 12,
              "m13.2" = 13, "m13.4" = 13,
              "m14.1" = 14, "m14.8" = 14,
              "m15.1" = 15, "m16.1" = 16)

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
