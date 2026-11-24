

x <- read.csv("fullsample_code.csv", header=TRUE)


library(plotrix) 
library(psych)
library(lme4)
library(tidyverse)
library(effects)
library(plyr)
library(texreg)

# Dummy coding gender
x$male0 <- x$sex
x$male0 <- gsub("M", "0", x$male0)
x$male0 <- gsub("F", "1", x$male0)
x$male0 <- as.numeric(x$male0)


# Factoring & releveling country to compare to CC Shuar
x$country.f <- factor(x$country, 
                      levels = c("CC Shuar", "UV Shuar", "USA", "Argentina" , "India"))

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



x %>%
  group_by(country) %>%
  summarise_at(vars(totaltomorrow), funs(mean(., na.rm=TRUE)))

x %>%
  group_by(country) %>%
  summarise_at(vars(totalrisk), funs(mean(., na.rm=TRUE)))

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
## retaining qnum:country + country:age


##~~~~~~~~~~# Final models for time --------------------------------
# main effects
timemod4 <- glmer(response ~  qnum + country.f + age.scale + male0  + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwait )
summary(timemod4) 


## interactions
timemod3 <- glmer(response ~  qnum + country.f + age.scale + qnum:country.f +
                  + country.f:age.scale + male0  + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwait )
summary(timemod3)



### outputting to an html table: TIME MODELS

htmlreg(
  list(timemod4, timemod3), # list of models to include
  file = "all groups time preferences main + intxn.doc",  # output filename
  stars = c(0.001, 0.01, 0.05),
  center = TRUE,                     # center on page
  digits = 2,                        # digits for coefs and standard errors
  naive = TRUE,
  single.row = FALSE,                # standard errors below coefs or on same line
  leading.zero = TRUE,
  custom.model.names = c("(1)", "(2)"), # model names
  inline.css = FALSE, doctype = TRUE, html.tag = TRUE, head.tag = TRUE, body.tag = TRUE
)



########### Data viz: Age and Time Preferences by Country (raw)
ageandtimeprefs2 <- ggplot(data=longxwait, aes(y=response, x=age, color=country.f)) + 
  stat_smooth(method=lm)  +
  scale_color_manual(legendtitle, values = c("deepskyblue2", "red",  "mediumpurple2", "pink",
                                             "aquamarine3")) +
  scale_fill_manual(legendtitle, values = c("deepskyblue2", "red",  "mediumpurple2", "pink",
                                             "aquamarine3")) + 
  ylab("Predicted Value (Percent Choosing Tomorrow)\n") +
  xlab("\nAge")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
ageandtimeprefs2 ## figure from raw data

## Order of countries is CC Shuar (deepskyblue2), UV Shuar (red), USA (mediumpurple2), 
## Argentina (pink), India (aquamarine3)


########### Data viz: Age and Time Preferences by Country 
## (predicted value)


timeandagevizmod <- glmer(response ~  qnum + country.f + age.scale + age.scale:country.f +
                            + male0  + (1|pid), 
                          family=binomial,
                          glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                          data=longxwait )
summary(timeandagevizmod)


effects2 <- allEffects(timeandagevizmod)
summary(effects2)
effects2_df <- lapply(effects2, as.data.frame)
mod.time.age.predicted <- effects2_df$`country.f:age.scale`
str(mod.time.age.predicted)

# CC Shuar (deepskyblue2), UV Shuar (red), USA (mediumpurple2), 
## Argentina (pink), India (aquamarine3)

mod.time.age.predicted$country.f <- factor(mod.time.age.predicted$country.f, 
                                     levels = c("CC Shuar", "UV Shuar", "USA" , 
                                                "Argentina", "India"))


legendtitle <- "Region" 

predicted.time <- ggplot(mod.time.age.predicted, aes(x=age.scale, y=fit, color = country.f)) + 
  geom_line(size = 1.5) +
  scale_color_manual(legendtitle, values = c("deepskyblue2", "red",  "mediumpurple2", "pink",
                                             "aquamarine3")) +
  scale_fill_manual(legendtitle, values = c("deepskyblue2", "red",  "mediumpurple2", "pink",
                                             "aquamarine3")) +
  geom_ribbon(data = mod.time.age.predicted, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = country.f), 
              alpha = .4, linetype = 0) +
  xlab("\n Age (standardized)") + ylab("Predicted Value (Percent Choosing Tomorrow Option)\n") + 
  #geom_hline(yintercept=0, colour="white", size=1) + ylim(0, 0.3) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
predicted.time
### Figure for manuscript???



##~~~~~~~~~~# Final models for risk--------------------------------


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
# retaining qnum:country, trending country:age

# main effects
riskmod4 <- (glmer(response ~  qnum + country.f + age.scale + male0 +  (1|pid), 
                   family=binomial,
                   glmerControl(optimizer="bobyqa",optCtrl = list(maxfun = 100000)),
                   data=longxrisk ))
summary(riskmod4)

# interaction (qnum:country)
riskmod3 <- (glmer(response ~  qnum + country.f + age.scale + qnum:country.f + 
                      male0 +  (1|pid), 
                   family=binomial,
                   glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                   data=longxrisk ))
summary(riskmod3) 

# interaction (age:country)
riskmod5 <- (glmer(response ~  qnum + country.f + age.scale + age.scale:country.f + 
                     male0 +  (1|pid), 
                   family=binomial,
                   glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                   data=longxrisk ))
summary(riskmod5) 



### outputting to an html table: RISK MODELS

htmlreg(
  list(riskmod4, riskmod3, riskmod5), # list of models to include
  file = "all groups risk preferences main + intxn.doc",  # output filename
  stars = c(0.001, 0.01, 0.05),
  center = TRUE,                     # center on page
  digits = 2,                        # digits for coefs and standard errors
  naive = TRUE,
  single.row = FALSE,                # standard errors below coefs or on same line
  leading.zero = TRUE,
  custom.model.names = c("(1)", "(2)", "(3)"), # model names
  inline.css = FALSE, doctype = TRUE, html.tag = TRUE, head.tag = TRUE, body.tag = TRUE
)






########## Data Viz: Age and Risk Preferences by Country 

## looking at raw data
ageandriskprefs2 <- ggplot(data=longxrisk, aes(y=response, x=age, color=country.f)) + 
  stat_smooth(method=lm) +
  scale_colour_manual(legendtitle, values = c("deepskyblue2", "red",  "mediumpurple2", "pink",
                                             "aquamarine3")) +
  scale_fill_manual(values = c("deepskyblue2", "red",  "mediumpurple2", "pink",
                                            "aquamarine3")) + 
  ylab("Percent Choosing Risky Option\n") +
  xlab("\nAge")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
ageandriskprefs2


########### Data viz: Age and Risk Preferences by Country 
## (predicted value)

riskandagevizmod <- glmer(response ~  qnum + country.f + age.scale + age.scale:country.f +
                            + male0  + (1|pid), 
                          family=binomial,
                          glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                          data=longxrisk )
summary(riskandagevizmod)


effects2 <- allEffects(riskandagevizmod)
summary(effects2)
effects2_df <- lapply(effects2, as.data.frame)
mod.risk.age.predicted <- effects2_df$`country.f:age.scale`
str(mod.risk.age.predicted)

mod.risk.age.predicted$country.f <- factor(mod.risk.age.predicted$country.f, 
                                           levels = c("CC Shuar", "UV Shuar", "USA" , 
                                                      "Argentina", "India"))


predicted.risk <- ggplot(mod.risk.age.predicted, aes(x=age.scale, y=fit, color = country.f)) + 
  geom_line(size = 1.5) +
  scale_color_manual(legendtitle, values = c("deepskyblue2", "red",  "mediumpurple2", "pink",
                                             "aquamarine3")) +
  scale_fill_manual(legendtitle, values = c("deepskyblue2", "red",  "mediumpurple2", "pink",
                                            "aquamarine3")) +
  geom_ribbon(data = mod.risk.age.predicted, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = country.f), 
              alpha = .4, linetype = 0) +
  xlab("\n Age (standardized)") + ylab("Predicted Value (Percent Choosing Risky Option)\n") + 
  #geom_hline(yintercept=0, colour="white", size=1) + ylim(0, 0.3) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
predicted.risk
### Figure for manuscript???



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
## QNUM coefficient is 0.356 for OLD

ss.young <- (glmer(response ~  qnum  + young + country.f:qnum +
                     qnum:young + male0 + (1|pid),
                   family=binomial,glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),data=longxrisk ))
summary(ss.young)
# QNUM coefficient is 0.24 for YOUNG




#### Visualizing the interaction between age & stake size
library(effects)
riskeffects <- allEffects(riskmod3)
summary(riskeffects)
riskeffects_df <- lapply(riskeffects, as.data.frame)
mod.risk.predicted <- riskeffects_df$`qnum:age.scale`
str(mod.risk.predicted)

mod.risk.predicted$age.scale <- as.factor(mod.risk.predicted$age.scale)
mod.risk.predicted$qnum <- as.factor(mod.risk.predicted$qnum)


mod.risk.predicted$age.scale <- revalue(mod.risk.predicted$age.scale, c("-2" = "youngest", "-0.7" = "young",
                                        "0.4" = "middle", "1" = "old", "3" = "oldest"))
stakesizeandage <- ggplot(mod.risk.predicted, aes(y=fit, x=qnum, fill = age.scale)) +
  facet_grid(. ~ age.scale) +
  geom_bar(stat="identity", position = "dodge") + guides(fill=FALSE) +
  ylab("Predicted Value (Percent Choosing Risky Option)\n") +
  xlab("\nStake size")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=12, family="Helvetica"))
stakesizeandage





## PREDICTED EFFECTS OF STAKE SIZE

## on time
effects1 <- allEffects(timemod3)

summary(effects1)
effects1_df <- lapply(effects1, as.data.frame)
mod.time.predicted <- effects1_df$`qnum:country.f`
str(mod.time.predicted)

legendtitle <- "Country"
pd <- position_dodge(.1)
predicted.values.time <- ggplot(mod.time.predicted, aes(x=qnum, y=fit, color = country.f)) + 
  geom_line(size = 1.5) +
  scale_color_manual(legendtitle, values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2", "red")) +
  geom_ribbon(data = mod.time.predicted, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = country.f), 
              alpha = .3, linetype = 0) +
  scale_fill_manual(legendtitle, values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2", "red")) +
  scale_size_area() + 
  ylab("Predicted Value (Percent Choosing Tomorrow)\n") +
  xlab("\nNumber of Candies for Tomorrow Reward")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))

predicted.values.time


# on risk

effects2 <- allEffects(riskmod3)
#, xlevels = list(qnum = seq(1, 5, by = 0.001)))
summary(effects2)
effects2_df <- lapply(effects2, as.data.frame)
mod.risk.predicted <- effects2_df$`qnum:country.f`
str(mod.risk.predicted)

pd <- position_dodge(.1)
predicted.values.risk <- ggplot(mod.risk.predicted, aes(x=qnum, y=fit, color = country.f)) + 
  geom_line(size = 1.5) +
  scale_color_manual(legendtitle, values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2", "red")) +
  geom_ribbon(data = mod.risk.predicted, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = country.f), 
              alpha = .3, linetype = 0) +
  scale_fill_manual(legendtitle, values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2", "red")) +
  scale_size_area() + 
  ylab("Predicted Value (Percent Choosing Risky Option)\n")+
  xlab("\nNumber of Candies for Risky Reward")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))

predicted.values.risk





