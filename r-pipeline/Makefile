RSCRIPT = Rscript

.PHONY: all data fits export clean

all: data fits export

data:
	$(RSCRIPT) R/get_data.R

fits: data
	$(RSCRIPT) R/fit_models.R

export: fits
	$(RSCRIPT) R/export_draws.R

clean:
	rm -rf fits/*.rds
