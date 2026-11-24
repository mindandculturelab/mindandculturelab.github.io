# Clean raw data and format for HDDDM

library(plyr)
library(tidyverse)

all.rxn <- read.csv("all.countries.rxn.time.FINAL.KMC.with.new.ids.csv", header = TRUE, na.strings = ".")
all.rxn <- all.rxn[all.rxn$actor.age.years >= 4,]
ddm.data <- all.rxn
ddm.data$outlier <- as.integer(ddm.data$rxn < .15 | ddm.data$rxn > 2.5)
ddm.data <- ddm.data[which(ddm.data$outlier == 0),]
ddm.data <- ddply(ddm.data, .(kmc.unique.id), mutate, z = scale(log(rxn)))
ddm.data$outlier <- as.integer(ddm.data$z < -3 | ddm.data$z > 3)
ddm.data <- ddm.data[which(ddm.data$outlier == 0),]
ddm.data <- ddply(ddm.data, .(kmc.unique.id, distribution), mutate, ntrials = length(rxn))
ddm.data <- ddply(ddm.data, .(kmc.unique.id), mutate, minTrials = min(ntrials))
ddm.data <- ddm.data[which(ddm.data$minTrials > 2),]
ddm.data <- ddply(ddm.data, .(kmc.unique.id), mutate, totalDists = length(unique(distribution)))
ddm.data <- ddm.data[which(ddm.data$totalDists == 2),]
ddm.data <- ddm.data[c("kmc.unique.id", "country", "condition", "distribution", "age.group", "rxn", "decision")]
ddm.data <- rename(ddm.data, c("subj_idx" = "kmc.unique.id", "age" = "age.group", "rt" = "rxn", "response" = "decision"))
ddm.data$response <- as.integer(ddm.data$response == "accept")
write.csv(ddm.data, "ddmData.csv", row.names = FALSE)
