# Chapter 4-9 fits. brms conventions per CLAUDE.md §5: cmdstanr backend,
# seed 1959, model names mirror the book, priors explicit in every call.
library(brms)
options(brms.backend = "cmdstanr")
SEED <- 1959
dir.create("fits", showWarnings = FALSE)

fit_cached <- function(name, expr) {
  path <- file.path("fits", paste0(name, ".rds"))
  if (file.exists(path)) {
    cat(name, "cached\n")
    return(invisible(readRDS(path)))
  }
  fit <- expr()
  saveRDS(fit, path)
  cat(name, "fitted\n")
  invisible(fit)
}

howell <- read.csv2("data/Howell1.csv")
howell$height <- as.numeric(howell$height)
howell$weight <- as.numeric(howell$weight)
adults <- howell[howell$age >= 18, ]
adults$weight_c <- adults$weight - mean(adults$weight)

fit_cached("m4.1", function() {
  brm(
    height ~ 1,
    data = adults,
    family = gaussian(),
    prior = c(
      prior(normal(178, 20), class = Intercept),
      prior(uniform(0, 50), class = sigma, ub = 50)
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

fit_cached("m4.3", function() {
  brm(
    height ~ 1 + weight_c,
    data = adults,
    family = gaussian(),
    prior = c(
      prior(normal(178, 20), class = Intercept),
      prior(lognormal(0, 1), class = b, lb = 0),
      prior(uniform(0, 50), class = sigma, ub = 50)
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

waffles <- read.csv2("data/WaffleDivorce.csv")
waffles$D <- scale(as.numeric(waffles$Divorce))[, 1]
waffles$M <- scale(as.numeric(waffles$Marriage))[, 1]
waffles$A <- scale(as.numeric(waffles$MedianAgeMarriage))[, 1]

std_priors <- c(
  prior(normal(0, 0.2), class = Intercept),
  prior(normal(0, 0.5), class = b),
  prior(exponential(1), class = sigma)
)

fit_cached("m5.1", function() {
  brm(D ~ 1 + A, data = waffles, family = gaussian(),
      prior = std_priors, seed = SEED, chains = 4, cores = 4)
})

fit_cached("m5.2", function() {
  brm(D ~ 1 + M, data = waffles, family = gaussian(),
      prior = std_priors, seed = SEED, chains = 4, cores = 4)
})

fit_cached("m5.3", function() {
  brm(D ~ 1 + M + A, data = waffles, family = gaussian(),
      prior = std_priors, seed = SEED, chains = 4, cores = 4)
})

milk <- read.csv2("data/milk.csv")
milk$K <- scale(as.numeric(milk$kcal.per.g))[, 1]
milk$N <- scale(as.numeric(milk$neocortex.perc))[, 1]
milk$M <- scale(log(as.numeric(milk$mass)))[, 1]
milk_cc <- milk[complete.cases(milk[, c("K", "N", "M")]), ]

fit_cached("m5.7", function() {
  brm(K ~ 1 + N + M, data = milk_cc, family = gaussian(),
      prior = std_priors, seed = SEED, chains = 4, cores = 4)
})

# --- Chapter 7: LOO/WAIC criteria on the divorce trio ------------------
# Chapter 7 fits no new models; it scores chapter 5's. Criteria are
# attached here so export can write a comparison artifact.
for (name in c("m5.1", "m5.2", "m5.3")) {
  path <- file.path("fits", paste0(name, ".rds"))
  if (file.exists(path)) {
    fit <- readRDS(path)
    if (is.null(fit$criteria$loo)) {
      fit <- add_criterion(fit, c("loo", "waic"))
      saveRDS(fit, path)
      cat(name, "criteria added\n")
    }
  }
}

# --- Chapter 8: terrain ruggedness and tulips ---------------------------
rugged <- read.csv2("data/rugged.csv")
rugged$rgdppc_2000 <- as.numeric(rugged$rgdppc_2000)
rugged$rugged <- as.numeric(rugged$rugged)
dd <- rugged[complete.cases(rugged$rgdppc_2000), ]
dd$log_gdp <- log(dd$rgdppc_2000)
dd$log_gdp_std <- dd$log_gdp / mean(dd$log_gdp)
dd$rugged_std <- dd$rugged / max(dd$rugged)
dd$rugged_std_c <- dd$rugged_std - mean(dd$rugged_std)
dd$cid <- factor(ifelse(dd$cont_africa == 1, "2", "1"))

rugged_priors <- function(with_slope) {
  p <- c(
    prior(normal(1, 0.1), class = b, coef = cid1),
    prior(normal(1, 0.1), class = b, coef = cid2),
    prior(exponential(1), class = sigma)
  )
  if (with_slope) {
    p <- c(p,
      prior(normal(0, 0.3), class = b, coef = "cid1:rugged_std_c"),
      prior(normal(0, 0.3), class = b, coef = "cid2:rugged_std_c"))
  }
  p
}

fit_cached("m8.1", function() {
  brm(log_gdp_std ~ 1 + rugged_std_c, data = dd, family = gaussian(),
      prior = c(
        prior(normal(1, 0.1), class = Intercept),
        prior(normal(0, 0.3), class = b),
        prior(exponential(1), class = sigma)
      ),
      seed = SEED, chains = 4, cores = 4)
})

fit_cached("m8.2", function() {
  brm(log_gdp_std ~ 0 + cid + rugged_std_c, data = dd, family = gaussian(),
      prior = c(
        prior(normal(1, 0.1), class = b, coef = cid1),
        prior(normal(1, 0.1), class = b, coef = cid2),
        prior(normal(0, 0.3), class = b, coef = rugged_std_c),
        prior(exponential(1), class = sigma)
      ),
      seed = SEED, chains = 4, cores = 4)
})

fit_cached("m8.3", function() {
  brm(log_gdp_std ~ 0 + cid + cid:rugged_std_c, data = dd,
      family = gaussian(), prior = rugged_priors(TRUE),
      seed = SEED, chains = 4, cores = 4)
})

tulips <- read.csv2("data/tulips.csv")
tulips$blooms <- as.numeric(tulips$blooms)
tulips$blooms_std <- tulips$blooms / max(tulips$blooms)
tulips$water_c <- tulips$water - mean(tulips$water)
tulips$shade_c <- tulips$shade - mean(tulips$shade)

tulip_priors <- c(
  prior(normal(0.5, 0.25), class = Intercept),
  prior(normal(0, 0.25), class = b),
  prior(exponential(1), class = sigma)
)

fit_cached("m8.4", function() {
  brm(blooms_std ~ 1 + water_c + shade_c, data = tulips,
      family = gaussian(), prior = tulip_priors,
      seed = SEED, chains = 4, cores = 4)
})

fit_cached("m8.5", function() {
  brm(blooms_std ~ 1 + water_c * shade_c, data = tulips,
      family = gaussian(), prior = tulip_priors,
      seed = SEED, chains = 4, cores = 4)
})

# --- Chapter 9: the same terrain model, HMC front and center ------------
# m9.1 is m8.3 refit with explicit chain settings; kept as its own
# artifact because chapter 9's explorer displays its diagnostics.
fit_cached("m9.1", function() {
  brm(log_gdp_std ~ 0 + cid + cid:rugged_std_c, data = dd,
      family = gaussian(), prior = rugged_priors(TRUE),
      seed = SEED, chains = 4, cores = 4,
      warmup = 1000, iter = 2000)
})
