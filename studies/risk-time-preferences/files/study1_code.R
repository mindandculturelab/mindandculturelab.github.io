
x <- read.csv("study1_data.csv", header=TRUE)

library(arm)
library(plotrix) 
library(psych)
library(tidyverse)
library(sm)
library(extrafont)
library(Matching)
library(lme4)
library(texreg)

# Dummy coding gender
x$male0 <- x$sex
x$male0 <- gsub("M", "0", x$male0)
x$male0 <- gsub("F", "1", x$male0)
x$male0 <- as.numeric(x$male0)


# Factoring & releveling country to compare to Ecuador
x$country.f <- factor(x$country, 
                      levels = c("Ecuador", "USA", "Argentina" , "India"))

# Descriptives ---------------------------------------------------------



# Ages
mean(x$age, na.rm=TRUE)
summary(x$age)
describe(x$age)
describe.by(x$age, x$country)
table(x$age)
counts <- table(x$age)
barplot(counts, main="All Groups: Age Frequencies",
        xlab="Age")

# Descriptive: Total Tomorrow Barplot
table(x$totaltomorrow)
tottom <- table(x$totaltomorrow)
barplot(tottom, main="All Groups: Total Tomorrow",
        xlab="Frequency")

# Descriptive: Total Risk Barplot
table(x$totalrisk)
totrisk <- table(x$totalrisk)
barplot(totrisk, main="All Groups: Total Risk",
        xlab="Frequency")

# Descriptive: Boxplots by Country
boxplot(x$totalsafe ~ x$country, ylab="Total number of safe choices")
boxplot(x$totaltomorrow ~ x$country, ylab="Total number of tomorrow choices")
boxplot(x$age ~ x$country)

# ALL: MEANS & SEs: Time
colMeans(x[11:15],na.rm=TRUE)
std.error(x[11:15])

# ALL: MEANS: Risk
colMeans(x[20:24],na.rm=TRUE)
std.error(x[20:24])

# Country-specific: MEANS & SEs: Time
xarg <- x[x$country.f=="Argentina",]
xecu <- x[x$country.f=="Ecuador",]
xind <- x[x$country.f=="India",]
xusa <- x[x$country.f=="USA",]

# Time
colMeans(xarg[11:15],na.rm=TRUE)
std.error(xarg[11:15])
colMeans(xecu[11:15],na.rm=TRUE)
std.error(xecu[11:15])
colMeans(xind[11:15],na.rm=TRUE)
std.error(xind[11:15])
colMeans(xusa[11:15],na.rm=TRUE)
std.error(xusa[11:15])

table(xarg$totaltomorrow)
table(xecu$totaltomorrow)
table(xind$totaltomorrow)
table(xusa$totaltomorrow)


# Risk
colMeans(xarg[20:24],na.rm=TRUE)
std.error(xarg[20:24])
colMeans(xecu[20:24],na.rm=TRUE)
std.error(xecu[20:24])
colMeans(xind[20:24],na.rm=TRUE)
std.error(xind[20:24])
colMeans(xusa[20:24],na.rm=TRUE)
std.error(xusa[20:24])

table(xarg$totalrisk)
table(xecu$totalrisk)
table(xind$totalrisk)
table(xusa$totalrisk)

# Descriptives: Age, sample size, male, by country
sum(x$existrisk)
sum(x$existtime)

# Risk
sum(with(x,x$existrisk=="1", na.rm=T))
sum(with(x, x$sex=="M" & x$existrisk=="1", na.rm=T))
# Time
sum(with(x,x$existtime=="1", na.rm=T))
sum(with(x, x$sex=="M" & x$existtime=="1", na.rm=T))

# Country-specific summaries for risk
summary(x$age[x$country=="Argentina" & x$existrisk=="1"])
sum(with(x, x$country=="Argentina" & x$existrisk=="1"))
sum(with(x, x$sex=="M" & x$country=="Argentina" & x$existrisk=="1"))

summary(x$age[x$country=="Ecuador" & x$existrisk=="1"])
sum(with(x, x$country=="Ecuador" & x$existrisk=="1"))
sum(with(x, x$sex=="M" & x$country=="Ecuador" & x$existrisk=="1"))

summary(x$age[x$country=="India"& x$existrisk=="1"] )
sum(with(x, x$country=="India") & x$existrisk=="1")
sum(with(x, x$sex=="M" & x$country=="India"))

summary(x$age[x$country=="USA" & x$existrisk=="1"])
sum(with(x, x$country=="USA" & x$existrisk=="1"))
sum(with(x, x$sex=="M" & x$country=="USA" & x$existrisk=="1"))

# Country-specific summaries for time
summary(x$age[x$country=="Argentina" & x$existtime=="1"])
sum(with(x, x$country=="Argentina" & x$existtime=="1"))
sum(with(x, x$sex=="M" & x$country=="Argentina" & x$existtime=="1"))

summary(x$age[x$country=="Ecuador" & x$existtime=="1"])
sum(with(x, x$country=="Ecuador" & x$existtime=="1"))
sum(with(x, x$sex=="M" & x$country=="Ecuador" & x$existtime=="1"))

summary(x$age[x$country=="India"& x$existtime=="1"] )
sum(with(x, x$country=="India") & x$existtime=="1")
sum(with(x, x$sex=="M" & x$country=="India" & x$existtime=="1"))

summary(x$age[x$country=="USA" & x$existtime=="1"])
sum(with(x, x$country=="USA" & x$existtime=="1"))
sum(with(x, x$sex=="M" & x$country=="USA" & x$existtime=="1"))

library(dplyr)
x %>%
  group_by(country) %>%
  summarise_at(vars(totaltomorrow), funs(mean(., na.rm=TRUE)))

x %>%
  group_by(country) %>%
  summarise_at(vars(totalrisk), funs(mean(., na.rm=TRUE)))



# Density plots ----------------------------------------------- 

# TOTAL TOMORROW

# Total Time: density plots with ggplot:
df.t <- data.frame(x$totaltomorrow[!is.na(x$totaltomorrow)], 
                   x$country[!is.na(x$totaltomorrow)])
names(df.t)[names(df.t)=="x.totaltomorrow..is.na.x.totaltomorrow.."] <- "totaltomorrow"
names(df.t)[names(df.t)=="x.country..is.na.x.totaltomorrow.."] <- "country"
head(df.t)
legendtitle <- "Region"

#df.t$country <- gsub("Ecuador", "Ecuador (cross-Cutucú Shuar)", 
                  #   df.t$country)
  

ggplot(df.t, aes(x=df.t$totaltomorrow), y=..scaled..) + 
  geom_density(aes(group=df.t$country, fill=df.t$country), size=0.1, alpha=0.4)  +
  scale_fill_manual(legendtitle, 
                    values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  xlab("\nTotal Tomorrow Choices") + ylab("Density\n") + 
  geom_hline(yintercept=0, colour="white", size=1) + ylim(0, 0.3) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
## Color order is Argentina(pink), Ecuador(deepskyblue2), india(aquamarine3), USA (mediumpurple2)


## BARPLOT of same plot as above: xc differences in time prefs

ggplot(df.t, aes(x=df.t$totaltomorrow, fill = df.t$country, group = df.t$country)) + 
  geom_bar() +
  scale_fill_manual(legendtitle, 
                    values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  xlab("\nTotal Tomorrow Choices") + ylab("Count\n") + 
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica")) +
  scale_x_continuous(breaks=c(0:5))


# Time histogram

ggplot(df.t, aes(x=df.t$totaltomorrow, fill = df.t$country, group = df.t$country)) + 
  geom_histogram(binwidth = 0.5, alpha = 0.5, aes(y=..density..),
                 position = 'identity') +  scale_x_continuous(breaks=c(0:5))    +
  scale_fill_manual(legendtitle, 
                    values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  xlab("\nTotal Tomorrow Choices") + ylab("Count\n") + 
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica")) 
 

# TOTAL RISK 


# Total Risk: density plots with ggplot:
df.r <- data.frame(x$totalrisk[!is.na(x$totalrisk)], 
                   x$country[!is.na(x$totalrisk)])




names(df.r)[names(df.r)=="x.totalrisk..is.na.x.totalrisk.."] <- "totalrisk"
names(df.r)[names(df.r)=="x.country..is.na.x.totalrisk.."] <- "country"
head(df.r)

df.r$country <- gsub("Ecuador", "Ecuador (cross-Cutucú Shuar)", 
                     df.r$country)

legendtitle <- "Region"
ggplot(df.r, aes(x=df.r$totalrisk), y=..scaled..) + 
  geom_density(aes(group=df.r$country, fill=df.r$country), size=0.1, alpha=0.4, bw=1)  +
  scale_fill_manual(legendtitle, 
                    values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  xlab("\nTotal Risky Choices") + ylab("Density\n") + 
  geom_hline(yintercept=0, colour="white", size=1) + ylim(0, 0.35) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"))+
  theme(text = element_text(size=15, family="Helvetica"))
# Color order is Argentina, Ecuador, India, USA  



## BARPLOT / Histogram of same plot as above: xc differences in risk prefs
ggplot(df.r, aes(x=df.r$totalrisk, fill = df.r$country, group = df.r$country)) + 
  geom_bar() +
  scale_fill_manual(legendtitle, 
                    values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  xlab("\nTotal Risky Choices") + ylab("Count\n") + 
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica")) +
  scale_x_continuous(breaks=c(0:5))


## Reshaping --------------------------------------------------------------

substrRight <- function(x, n){
  substr(x, nchar(x)-n+1, nchar(x))
}


## Please note that the variable "qnum" refers to the stake size of the 
## tomorrow reward and the risky reward. It is referred to as "qnum" and
## "trial" in our code, but is reported in the manuscript as "Stake size" for clarity.

longxwait <- x %>%
  dplyr::select(pid,age,country.f,sex,male0,riskfirst1:totaltomorrow,
                risky1:risky5,totalsafe) %>%
  gather(quest,response,tomorrow1:tomorrow5) %>%
  mutate(qnum=as.numeric(substrRight(quest,1)),first=ifelse(qnum==1,1,0))

longxrisk <- x %>%
  dplyr::select(pid,age,country.f,sex,male0,riskfirst1:totalrisk,
                risky1:risky5,totalsafe) %>%
  gather(quest,response,risky1:risky5) %>%
  mutate(qnum=as.numeric(substrRight(quest,1)),first=ifelse(qnum==1,1,0))


stageMeansWait <- longxwait %>% 
  group_by(quest) %>%
  summarise(tomMean = mean(response,na.rm=T),
            count=length(response),
            seM=sqrt(tomMean*(1-tomMean)/count))

stageMeansRisk <- longxrisk %>% 
  group_by(quest) %>%
  summarise(yesMean = mean(response,na.rm=T),
            count=length(response),
            seM=sqrt(yesMean*(1-yesMean)/count))

## Plotting Means Across All Countries ---------------------------------------------
library(ggplot2) 
# Plotting means of tomorrow & risk
ggplot(data=stageMeansWait, aes(x=quest, y=tomMean, group=1)) +
  geom_bar(stat='identity') +
  coord_cartesian(ylim = c(0, 1)) +
  geom_errorbar(aes(ymin=tomMean-seM, ymax=tomMean+seM), 
                colour="black", width=.1, position=position_dodge())

ggplot(data=stageMeansRisk, aes(x=quest, y=yesMean, group=1)) +
  geom_bar(stat='identity') +
  coord_cartesian(ylim = c(0, 1)) +
  geom_errorbar(aes(ymin=yesMean-seM, ymax=yesMean+seM), 
                colour="black", width=.1, position=position_dodge())


#==== Model Prep:
longxwait$age.scale <- scale(longxwait$age)
longxrisk$age.scale <- scale(longxrisk$age)


#====== MODELS ========================================================

# Time: Model selection: --------------------------------------------------

# Qnum * Country.f TIME 

timemod <- glmer(response ~  qnum * country.f *age.scale + male0  + (1|pid), 
                 family=binomial,
                 glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                 data=longxwait )
summary(timemod)
drop1(timemod,test="Chisq")
## dropping 3-way

timemod2 <- glmer(response ~  (qnum + country.f + age.scale)^2 + male0  + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwait )
summary(timemod2)
drop1(timemod2,test="Chisq")
## retaining qnum:country


##~~~~~~~~~~# Final models for time --------------------------------
## interactions
timemod3 <- glmer(response ~  qnum + country.f + age.scale + qnum:country.f +
                  + male0  + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwait )
summary(timemod3)

# main effects
timemod4 <- glmer(response ~  qnum + country.f + age.scale + male0  + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwait )
summary(timemod4) 



### outputting to an html table: TIME MODELS

htmlreg(
  list(timemod4, timemod3), # list of models to include
  file = "xc time preferences main + intxn.doc",  # output filename
  stars = c(0.001, 0.01, 0.05),
  center = TRUE,                     # center on page
  digits = 2,                        # digits for coefs and standard errors
  naive = TRUE,
  single.row = FALSE,                # standard errors below coefs or on same line
  leading.zero = TRUE,
  custom.model.names = c("(1)", "(2)"), # model names
  inline.css = FALSE, doctype = TRUE, html.tag = TRUE, head.tag = TRUE, body.tag = TRUE
)


# Data viz
ageandtimeprefs2 <- ggplot(data=longxwait, aes(y=response, x=age, color=country.f)) + 
  stat_smooth(method=lm)
ageandtimeprefs2


#### With other countries as the baseline

# Argentina as baseline
longxwaitA <- longxwait
longxwaitA$country.f <- factor(longxwaitA$country.f, 
                            levels = c( "Argentina", "Ecuador", "USA", "India"))

timemod5 <- glmer(response ~  qnum + country.f + age.scale + male0  + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwaitA )
summary(timemod5) 

# India as baseline
longxwaitI <- longxwait
longxwaitI$country.f <- factor(longxwaitA$country.f, 
                               levels = c("India", "Argentina", "Ecuador", "USA" ))

timemod6 <- glmer(response ~  qnum + country.f + age.scale + male0  + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwaitI )
summary(timemod6) 


### Risk: Model selection: --------------------------------------------------

riskmod <- (glmer(response ~  (qnum + country.f + age.scale)^3 + male0 +  (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxrisk ))
summary(riskmod)
drop1(riskmod, test = "Chisq")
# dropping 3-way


riskmod2 <-(glmer(response ~  (qnum + country.f + age.scale)^2 + male0 +  (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa",optCtrl = list(maxfun = 100000)),
                  data=longxrisk ))
summary(riskmod2)
drop1(riskmod2, test = "Chisq")
# retaining qnum:country, qnum:age


##~~~~~~~~~~# Final models for risk--------------------------------
# interactions
riskmod3 <- (glmer(response ~  qnum + country.f + age.scale + qnum:country.f + 
                     qnum:age.scale + male0 +  (1|pid), 
                   family=binomial,
                   glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                   data=longxrisk ))
summary(riskmod3) 

# main effects
riskmod4 <- (glmer(response ~  qnum + country.f + age.scale + male0 +  (1|pid), 
                   family=binomial,
                   glmerControl(optimizer="bobyqa",optCtrl = list(maxfun = 100000)),
                   data=longxrisk ))
summary(riskmod4)




### outputting to an html table: RISK MODELS

htmlreg(
  list(riskmod4, riskmod3), # list of models to include
  file = "xc risk preferences main + intxn.doc",  # output filename
  stars = c(0.001, 0.01, 0.05),
  center = TRUE,                     # center on page
  digits = 2,                        # digits for coefs and standard errors
  naive = TRUE,
  single.row = FALSE,                # standard errors below coefs or on same line
  leading.zero = TRUE,
  custom.model.names = c("(1)", "(2)"), # model names
  inline.css = FALSE, doctype = TRUE, html.tag = TRUE, head.tag = TRUE, body.tag = TRUE
)



# Data Viz
ageandriskprefs2 <- ggplot(data=longxrisk, aes(y=response, x=age, color=country.f)) + 
  stat_smooth(method=lm)
ageandriskprefs2

#### With other countries as the baseline

# Argentina as baseline
longxriskA <- longxrisk
longxriskA$country.f <- factor(longxriskA$country.f, 
                               levels = c( "Argentina", "Ecuador", "USA", "India"))
riskmod5 <- (glmer(response ~  qnum + country.f + age.scale + male0 +  (1|pid), 
                   family=binomial,
                   glmerControl(optimizer="bobyqa",optCtrl = list(maxfun = 100000)),
                   data=longxriskA ))
summary(riskmod5)

# India as baseline
longxriskI <- longxrisk
longxriskI$country.f <- factor(longxriskA$country.f, 
                               levels = c("India", "Argentina", "Ecuador", "USA"))
riskmod6 <- (glmer(response ~  qnum + country.f + age.scale + male0 +  (1|pid), 
                   family=binomial,
                   glmerControl(optimizer="bobyqa",optCtrl = list(maxfun = 100000)),
                   data=longxriskI ))
summary(riskmod6)

## Simple slopes analysis ------------------------- 
longxrisk$old <- longxrisk$age.scale - 1
longxrisk$young <- longxrisk$age.scale + 1

ss.mean <- (glmer(response ~  qnum + country.f + age.scale + country.f:qnum +
                   qnum:age.scale + male0 + (1|pid), 
                 family=binomial,
                 glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),data=longxrisk ))
summary(ss.mean)

ss.old <- (glmer(response ~  qnum  + old + country.f:qnum +
                     qnum:old + male0 + (1|pid), 
                   family=binomial,
                 glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),data=longxrisk ))
summary(ss.old)
## QNUM coefficient is 0.440 for OLD

ss.young <- (glmer(response ~  qnum  + young + country.f:qnum +
                     qnum:young + male0 + (1|pid),
                   family=binomial,glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),data=longxrisk ))
summary(ss.young)
# QNUM coefficient is 0.19 for YOUNG

# Data viz (figure in supplement)
library(effects)
riskeffects <- allEffects(riskmod3)
summary(riskeffects)
riskeffects_df <- lapply(riskeffects, as.data.frame)
mod.risk.predicted <- riskeffects_df$`qnum:age.scale`
str(mod.risk.predicted)

mod.risk.predicted$age.scale <- as.factor(mod.risk.predicted$age.scale)
mod.risk.predicted$qnum <- as.factor(mod.risk.predicted$qnum)

library(plyr)
mod.risk.predicted$age.scale <- revalue(mod.risk.predicted$age.scale, c("-2" = "youngest", "-0.7" = "young",
                                        "0.4" = "old", "2" = "old", "3" = "oldest"))
riskplot <- ggplot(mod.risk.predicted, aes(y=fit, x=qnum, fill = age.scale)) +
  facet_grid(. ~ age.scale) +
  geom_bar(stat="identity", position = "dodge") + guides(fill=FALSE) +
  ylab("Predicted Value (Percent Choosing Risky Option)\n") +
  xlab("\nStake size")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=12, family="Helvetica"))
riskplot


## Predicted Effects (Graphs) ----------------------- 
# Time Effects
library(effects)
effects1 <- allEffects(timemod3)

summary(effects1)
effects1_df <- lapply(effects1, as.data.frame)
mod.time.predicted <- effects1_df$`qnum:country.f`
str(mod.time.predicted)

legendtitle <- "Country"
pd <- position_dodge(.1)
predicted.values.time <- ggplot(mod.time.predicted, aes(x=qnum, y=fit, color = country.f)) + 
  geom_line(size = 1.5) +
  scale_color_manual(legendtitle, values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  geom_ribbon(data = mod.time.predicted, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = country.f), 
              alpha = .3, linetype = 0) +
  scale_fill_manual(legendtitle, values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  scale_size_area() + 
  ylab("Predicted Value (Percent Choosing Tomorrow)\n") +
  xlab("\nNumber of Candies for Tomorrow Reward")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))

predicted.values.time


# Risk Effects

effects2 <- allEffects(riskmod3)
#, xlevels = list(qnum = seq(1, 5, by = 0.001)))
summary(effects2)
effects2_df <- lapply(effects2, as.data.frame)
mod.risk.predicted <- effects2_df$`qnum:country.f`
str(mod.risk.predicted)

pd <- position_dodge(.1)
predicted.values.risk <- ggplot(mod.risk.predicted, aes(x=qnum, y=fit, color = country.f)) + 
  geom_line(size = 1.5) +
  scale_color_manual(legendtitle, values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  geom_ribbon(data = mod.risk.predicted, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = country.f), 
              alpha = .3, linetype = 0) +
  scale_fill_manual(legendtitle, values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  scale_size_area() + 
  ylab("Predicted Value (Percent Choosing Risky Option)\n")+
  xlab("\nNumber of Candies for Risky Reward")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))

predicted.values.risk



#### Matching KS -------------------------------- 


# RISK
# Ecuador vs. Argentina
ks.boot(x$totalrisk[x$country.f == "Ecuador"],x$totalrisk[x$country.f == "Argentina"], nboots = 500)
# Ecuador vs. USA
ks.boot(x$totalrisk[x$country.f == "Ecuador"],x$totalrisk[x$country.f == "USA"], nboots = 500)
# Ecuador vs. India
ks.boot(x$totalrisk[x$country.f == "India"],x$totalrisk[x$country.f == "Ecuador"], nboots = 500)

# Argentina vs. India
ks.boot(x$totalrisk[x$country.f == "India"],x$totalrisk[x$country.f == "Argentina"], nboots = 500)
# Argentina vs. USA
ks.boot(x$totalrisk[x$country.f == "USA"],x$totalrisk[x$country.f == "Argentina"], nboots = 500)
# India vs. USA
ks.boot(x$totalrisk[x$country.f == "India"],x$totalrisk[x$country.f == "USA"], nboots = 500)


# TIME
# Ecuador vs. Argentina
ks.boot(x$totaltomorrow[x$country.f == "Ecuador"],x$totaltomorrow[x$country.f == "Argentina"], nboots = 500)
# Ecuador vs. USA
ks.boot(x$totaltomorrow[x$country.f == "Ecuador"],x$totaltomorrow[x$country.f == "USA"], nboots = 500)
# Ecuador vs. India
ks.boot(x$totaltomorrow[x$country.f == "India"],x$totaltomorrow[x$country.f == "Ecuador"], nboots = 500)

# Argentina vs. India
ks.boot(x$totaltomorrow[x$country.f == "India"],x$totaltomorrow[x$country.f == "Argentina"], nboots = 500)
# Argentina vs. USA
ks.boot(x$totaltomorrow[x$country.f == "USA"],x$totaltomorrow[x$country.f == "Argentina"], nboots = 500)
# India vs. USA
ks.boot(x$totaltomorrow[x$country.f == "India"],x$totaltomorrow[x$country.f == "USA"], nboots = 500)



## Supplementary Analyses ----------------------

# Risk x Age interaction
ageandriskprefs.model  <- (glmer(response ~  qnum + country.f + age.scale + qnum:country.f + 
                                   qnum:age.scale + country.f:age.scale + male0 + (1|pid), 
                                 family=binomial,glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),data=longxrisk ))
summary(ageandriskprefs.model)

# Data viz
legendtitle <- "Country"
ageandriskprefs <- ggplot(data=longxrisk, aes(y=response, x=age, fill=country.f, color=country.f)) + 
  stat_smooth(method=lm) + 
  scale_fill_manual(legendtitle, 
                    values = c("deepskyblue2", "mediumpurple2", "pink","aquamarine3")) +
  scale_color_manual(legendtitle, 
                     values = c("deepskyblue2", "mediumpurple2", "pink","aquamarine3")) +
  xlab("Age") + ylab("Response: Choosing Risky") +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"))+
  theme(text = element_text(size=15, family="Helvetica")) +
  theme(legend.position="none")
ageandriskprefs


# Order effects -------------------------- 
# NO for time
summary(glmer(response ~  qnum * riskfirst1 +  (1|pid), family=binomial,
              data=subset(longxwait,country.f !=  'Argentina')))
summary(glmer(response ~  qnum + riskfirst1 +  (1|pid), family=binomial,
              data=subset(longxwait,country.f !=  'Argentina')))
# NO for risk
summary(glmer(response ~  qnum * riskfirst1 +  (1|pid), family=binomial,
              data=subset(longxrisk,country.f !=  'Argentina')))
summary(glmer(response ~  qnum + riskfirst1 +  (1|pid), family=binomial,
              data=subset(longxrisk,country.f !=  'Argentina')))

