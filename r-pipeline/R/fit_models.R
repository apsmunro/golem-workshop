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
howell$age <- as.numeric(howell$age) # else `>= 18` is a string compare: kids leak in
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

# --- Chapter 11: binomial and Poisson GLMs ------------------------------
# Chapter 10 fits no models (it derives GLMs and maximum entropy); its
# interactives run on closed-form JS. The count golems start here.

chimp <- read.csv2("data/chimpanzees.csv")
chimp$treatment <- factor(1 + chimp$prosoc_left + 2 * chimp$condition)
chimp$actor <- factor(chimp$actor)

fit_cached("m11.4", function() {
  brm(
    pulled_left ~ 0 + actor + treatment,
    data = chimp, family = bernoulli(),
    prior = c(
      prior(normal(0, 1.5), class = b, coef = actor1),
      prior(normal(0, 1.5), class = b, coef = actor2),
      prior(normal(0, 1.5), class = b, coef = actor3),
      prior(normal(0, 1.5), class = b, coef = actor4),
      prior(normal(0, 1.5), class = b, coef = actor5),
      prior(normal(0, 1.5), class = b, coef = actor6),
      prior(normal(0, 1.5), class = b, coef = actor7),
      prior(normal(0, 0.5), class = b, coef = treatment2),
      prior(normal(0, 0.5), class = b, coef = treatment3),
      prior(normal(0, 0.5), class = b, coef = treatment4)
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

ucb <- read.csv2("data/UCBadmit.csv")
ucb$gid <- factor(ifelse(ucb$applicant.gender == "male", "male", "female"))
ucb$dept <- factor(ucb$dept)

# m11.7: total effect of gender
fit_cached("m11.7", function() {
  brm(
    admit | trials(applications) ~ 0 + gid,
    data = ucb, family = binomial(),
    prior = prior(normal(0, 1.5), class = b),
    seed = SEED, chains = 4, cores = 4
  )
})

# m11.8: gender within department (direct effect)
fit_cached("m11.8", function() {
  brm(
    admit | trials(applications) ~ 0 + gid + dept,
    data = ucb, family = binomial(),
    prior = prior(normal(0, 1.5), class = b),
    seed = SEED, chains = 4, cores = 4
  )
})

kline <- read.csv2("data/Kline.csv")
kline$P <- as.numeric(scale(log(kline$population)))
kline$contact_id <- factor(ifelse(kline$contact == "high", "high", "low"))

# m11.10: interaction of log population and contact on tool count
fit_cached("m11.10", function() {
  brm(
    total_tools ~ 0 + contact_id + contact_id:P,
    data = kline, family = poisson(),
    prior = c(
      prior(normal(3, 0.5), class = b, coef = contact_idhigh),
      prior(normal(3, 0.5), class = b, coef = contact_idlow),
      prior(normal(0, 0.2), class = b, coef = "contact_idhigh:P"),
      prior(normal(0, 0.2), class = b, coef = "contact_idlow:P")
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

# --- Chapter 12: mixtures, over-dispersion, ordered categories ----------

# m12.1: beta-binomial on UCBadmit — over-dispersion instead of dept
fit_cached("m12.1", function() {
  brm(
    admit | trials(applications) ~ 0 + gid,
    data = ucb, family = beta_binomial(),
    prior = c(
      prior(normal(0, 1.5), class = b),
      prior(exponential(1), class = phi)
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

# m12.3: zero-inflated Poisson, the drinking monks (simulated as in the book)
set.seed(SEED)
N_days <- 365
drink <- rbinom(N_days, 1, 0.2)
monks <- (1 - drink) * rpois(N_days, 1)
monk_df <- data.frame(y = monks)

fit_cached("m12.3", function() {
  brm(
    bf(y ~ 1, zi ~ 1),
    data = monk_df, family = zero_inflated_poisson(),
    prior = c(
      prior(normal(1, 0.5), class = Intercept),
      prior(normal(-1.5, 1), class = Intercept, dpar = zi)
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

trolley <- read.csv2("data/Trolley.csv")
trolley$response <- as.integer(trolley$response)

# m12.4: intercept-only ordered logit (the seven cutpoints)
fit_cached("m12.4", function() {
  brm(
    response ~ 1,
    data = trolley, family = cumulative("logit"),
    prior = prior(normal(0, 1.5), class = Intercept),
    seed = SEED, chains = 4, cores = 4
  )
})

# m12.5: full action/intention/contact ordered logit with interactions
fit_cached("m12.5", function() {
  brm(
    response ~ action + contact + intention +
      intention:action + intention:contact,
    data = trolley, family = cumulative("logit"),
    prior = c(
      prior(normal(0, 0.5), class = b),
      prior(normal(0, 1.5), class = Intercept)
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

# --- Chapter 13: models with memory ------------------------------------

reed <- read.csv2("data/reedfrogs.csv")
reed$surv <- as.integer(reed$surv)
reed$density <- as.integer(reed$density)
reed$tank <- seq_len(nrow(reed))

# m13.2: varying intercept per tank (partial pooling)
fit_cached("m13.2", function() {
  brm(
    surv | trials(density) ~ 1 + (1 | tank),
    data = reed, family = binomial(),
    prior = c(
      prior(normal(0, 1.5), class = Intercept),
      prior(exponential(1), class = sd)
    ),
    seed = SEED, chains = 4, cores = 4,
    control = list(adapt_delta = 0.95)
  )
})

# m13.4: chimpanzees, cross-classified varying intercepts (actor + block)
chimp$block <- factor(chimp$block)
fit_cached("m13.4", function() {
  brm(
    pulled_left ~ 1 + treatment + (1 | actor) + (1 | block),
    data = chimp, family = bernoulli(),
    prior = c(
      prior(normal(0, 1.5), class = Intercept),
      prior(normal(0, 0.5), class = b),
      prior(exponential(1), class = sd)
    ),
    seed = SEED, chains = 4, cores = 4,
    control = list(adapt_delta = 0.95)
  )
})

# --- Chapter 14: adventures in covariance ------------------------------

# m14.1: the café varying-slopes model, simulated exactly as in the book.
set.seed(SEED)
a_bar <- 3.5; b_bar <- -1; sigma_a <- 1; sigma_b <- 0.5; rho <- -0.7
Mu <- c(a_bar, b_bar)
cov_ab <- sigma_a * sigma_b * rho
Sigma <- matrix(c(sigma_a^2, cov_ab, cov_ab, sigma_b^2), ncol = 2)
N_cafes <- 20
vary_effects <- MASS::mvrnorm(N_cafes, Mu, Sigma)
a_cafe <- vary_effects[, 1]; b_cafe <- vary_effects[, 2]
N_visits <- 10
afternoon <- rep(0:1, N_visits * N_cafes / 2)
cafe_id <- rep(seq_len(N_cafes), each = N_visits)
mu <- a_cafe[cafe_id] + b_cafe[cafe_id] * afternoon
cafe_df <- data.frame(cafe = cafe_id, afternoon = afternoon,
                      wait = rnorm(N_visits * N_cafes, mu, 0.5))

fit_cached("m14.1", function() {
  brm(
    wait ~ 1 + afternoon + (1 + afternoon | cafe),
    data = cafe_df, family = gaussian(),
    prior = c(
      prior(normal(5, 2), class = Intercept),
      prior(normal(-1, 0.5), class = b),
      prior(exponential(1), class = sd),
      prior(exponential(1), class = sigma),
      prior(lkj(2), class = cor)
    ),
    seed = SEED, chains = 4, cores = 4,
    control = list(adapt_delta = 0.95)
  )
})

# m14.8: Oceanic tools Gaussian process over geographic distance.
# brms parameterizes the GP with lon/lat coordinates; the book uses the
# raw distance matrix with cov_GPL2. We supply coordinates so the gp() term
# reproduces the squared-exponential covariance.
kline$lon2 <- c(167.5, 168.8, 165.8, 138.1, 178.8, 151.1, 151.8, 147.0, -175.2, -155.5)
kline$lat2 <- c(-16.3, -12.3, -10.7, 9.5, -18.0, -8.5, 7.4, -2.1, -21.2, 19.9)

fit_cached("m14.8", function() {
  brm(
    total_tools ~ 1 + gp(lon2, lat2, scale = FALSE),
    data = kline, family = poisson(),
    prior = c(
      prior(normal(3, 0.5), class = Intercept),
      prior(inv_gamma(2, 1), class = lscale, coef = gplon2lat2),
      prior(exponential(1), class = sdgp)
    ),
    seed = SEED, chains = 4, cores = 4,
    control = list(adapt_delta = 0.95)
  )
})

# --- Chapter 15: measurement error and missing data --------------------

waffles$D <- scale(as.numeric(waffles$Divorce))[, 1]
waffles$A2 <- scale(as.numeric(waffles$MedianAgeMarriage))[, 1]
waffles$M2 <- scale(as.numeric(waffles$Marriage))[, 1]
# read.csv2 turns the "Divorce SE" header into Divorce.SE
waffles$D_sd <- as.numeric(waffles$Divorce.SE) / sd(as.numeric(waffles$Divorce))

# m15.1: divorce measured with error, regressed on age and marriage rate
fit_cached("m15.1", function() {
  brm(
    D | mi(D_sd) ~ A2 + M2,
    data = waffles, family = gaussian(),
    prior = c(
      prior(normal(0, 0.2), class = Intercept),
      prior(normal(0, 0.5), class = b),
      prior(exponential(1), class = sigma)
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

# m15.5: milk kcal with neocortex imputed from body mass
milk$K <- scale(as.numeric(milk$kcal.per.g))[, 1]
milk$N <- scale(as.numeric(milk$neocortex.perc))[, 1]
milk$M <- scale(log(as.numeric(milk$mass)))[, 1]

fit_cached("m15.5", function() {
  brm(
    bf(K ~ mi(N) + M) + bf(N | mi() ~ M) + set_rescor(FALSE),
    data = milk, family = gaussian(),
    prior = c(
      prior(normal(0, 0.5), class = b, resp = "K"),
      prior(normal(0, 0.5), class = b, resp = "N"),
      prior(exponential(1), class = sigma, resp = "K"),
      prior(exponential(1), class = sigma, resp = "N")
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

# --- Chapter 16: generalized linear madness -----------------------------

# m16.1: the cylinder weight model — weight ∝ height³, the cube structural.
howell_all <- read.csv2("data/Howell1.csv")
howell_all$h <- as.numeric(howell_all$height) / mean(as.numeric(howell_all$height))
howell_all$w <- as.numeric(howell_all$weight) / mean(as.numeric(howell_all$weight))

fit_cached("m16.1", function() {
  brm(
    bf(w ~ log(3.141593 * k * p^2 * h^3), k ~ 1, p ~ 1, nl = TRUE),
    data = howell_all, family = lognormal(),
    prior = c(
      prior(exponential(0.5), nlpar = "k", lb = 0),
      prior(beta(2, 18), nlpar = "p", lb = 0, ub = 1)
    ),
    seed = SEED, chains = 4, cores = 4
  )
})

# m16.5 (lynx–hare ODE): fit in raw Stan with integrate_ode_rk45; not a
# plain brm() call, so it is documented in the chapter's "Run this
# yourself" panel rather than exported here. The web interactive solves
# the same equations with RK4 in JavaScript.
