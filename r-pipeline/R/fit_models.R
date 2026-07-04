# Chapter 4-6 fits. brms conventions per CLAUDE.md §5: cmdstanr backend,
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
