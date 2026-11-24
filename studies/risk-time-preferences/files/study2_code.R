## Shuar Comparison

x <- read.csv("study2_data.csv", header=TRUE)



library(tidyverse)
library(psych)
library(lme4)

## Dummy coding gender
x$male0 <- x$sex
x$male0 <- gsub("M", "0", x$male0)
x$male0 <- gsub("F", "1", x$male0)
x$male0 <- as.numeric(x$male0)

## Coding locations
x$geo <- x$location
x$geo <- gsub("San Ramon", "Cross Cutucu", x$geo)
x$geo <- gsub("Panints", "Cross Cutucu", x$geo)
x$geo <- gsub("Pablo Sexo", "Upano Valley", x$geo)
x$geo <- gsub("Yamanunka", "Upano Valley", x$geo)
x$geo <- gsub("Sintinis", "Upano Valley", x$geo)
x$geo <- as.factor(x$geo)
str(x$geo)



# Descriptives ---------------------------------------------------------

# Ages
counts <- table(x$age)
barplot(counts, main="Age Frequencies",
        xlab="Age")

ccage <- table(x$age[x$region=="Cross Cutucu"])
barplot(ccage, main="CC Age Frequencies",
        xlab="Age")

uvage <- table(x$age[x$region=="Upano Valley"])
barplot(uvage, main="UV Age Frequencies",
        xlab="Age")

mean(x$age[x$region=="Cross Cutucu"], na.rm = T)
mean(x$age[x$region=="Upano Valley"], na.rm = T)

t.test(uvage, ccage)
## ages not significantly different 

# Sample sizes 
table(x$existrisk)
sum(with(x, x$geo=="Cross Cutucu" & x$existrisk=="1", na.rm=T)) 
sum(with(x, x$geo=="Cross Cutucu" & x$sex=="M" & x$existrisk=="1", na.rm=T)) 
sum(with(x, x$geo=="Upano Valley" & x$existrisk=="1", na.rm=T)) 
sum(with(x, x$geo=="Upano Valley" & x$sex=="M" & x$existrisk=="1", na.rm=T)) 

table(x$existtime) 
sum(with(x, x$geo=="Upano Valley" & x$existtime=="1", na.rm=T)) 
sum(with(x, x$geo=="Upano Valley" & x$sex=="M" & x$existtime=="1", na.rm=T)) 
sum(with(x, x$geo=="Cross Cutucu" & x$existtime=="1", na.rm=T))
sum(with(x, x$geo=="Cross Cutucu" & x$sex=="M" & x$existtime=="1", na.rm=T))




x$region <- gsub("Cross Cutucu", "cross-Cutucú", x$region)
## Time: density plots:
df.t <- data.frame(x$totaltomorrow[!is.na(x$totaltomorrow)], 
                   x$region[!is.na(x$totaltomorrow)])
names(df.t)[names(df.t)=="x.totaltomorrow..is.na.x.totaltomorrow.."] <- "totaltomorrow"
names(df.t)[names(df.t)=="x.region..is.na.x.totaltomorrow.."] <- "region"
head(df.t)
legendtitle <- "Region"
ggplot(df.t, aes(x=df.t$totaltomorrow), y=..scaled..) + 
  geom_density(aes(group=df.t$region, fill=df.t$region), size=0.1, alpha=0.4, bw =1)  +
  scale_fill_manual(legendtitle, 
                    values = c("deepskyblue2","red")) +
  xlab("Total Tomorrow Choices") + ylab("Density") + 
  geom_hline(yintercept=0, colour="white", size=1) + ylim(0, 0.25) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
## UV starting to get more tomorrow oriented

## Risk: density plots:
df.t <- data.frame(x$totalrisk[!is.na(x$totalrisk)], 
                   x$region[!is.na(x$totalrisk)])
names(df.t)[names(df.t)=="x.totalrisk..is.na.x.totalrisk.."] <- "totalrisk"
names(df.t)[names(df.t)=="x.region..is.na.x.totalrisk.."] <- "region"
head(df.t)
legendtitle <- "Region"
ggplot(df.t, aes(x=df.t$totalrisk)) + 
  geom_density(aes(group=df.t$region, fill=df.t$region), size=0.1, alpha=0.4, bw =1)  +
  scale_fill_manual(legendtitle, 
                    values = c("deepskyblue2","red")) +
  xlab("Total Risky Choices") + ylab("Density") + 
  geom_hline(yintercept=0, colour="white", size=1) + ylim(0, 0.3) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
## UV starting to get more risky


## Reshaping --------------------------------------------------------------

substrRight <- function(x, n){
  substr(x, nchar(x)-n+1, nchar(x))
}

longxwait <- x %>%
  dplyr::select(pid,age,region,sex,male0,geo,riskfirst1:totaltomorrow) %>%
  gather(quest,response,tomorrow1:tomorrow5) %>%
  mutate(qnum=as.numeric(substrRight(quest,1)),first=ifelse(qnum==1,1,0))

longxrisk <- x %>%
  dplyr::select(pid,age,region,sex,male0, location,geo,riskfirst1,risky1:totalrisk, totalsafe) %>%
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


# ==== Model Prep:
longxwait$geo <- as.factor(longxwait$geo)
longxwait$age.std <- (longxwait$age - mean(longxwait$age,na.rm=T))/sd(longxwait$age,na.rm=T)

longxwait$old <- longxwait$age.std - 1
longxwait$young <- longxwait$age.std + 1

longxrisk$age.std <- (longxrisk$age - mean(longxrisk$age,na.rm=T))/
  sd(longxrisk$age,na.rm=T)



#====== MODELS ========================================================



### Primary Models: --------------------------------------------------

# TIME:--------------------------------------------------------------- 


timemod <- glmer(response ~ qnum * age.std * geo + male0 + (1|pid), family=binomial,
                 glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                 data=longxwait )
summary(timemod)
drop1(timemod,test="Chisq")

timemod2 <- glmer(response ~  (qnum + geo + age.std)^2 + male0  + (1|pid), family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwait )
summary(timemod2)
drop1(timemod2,test="Chisq")


##~~~~~~~~~~# Final model for time? (MAIN EFFECTS) ---------------------------
timemod4 <- glmer(response ~  qnum + geo + age.std + male0  + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwait )
summary(timemod4) 



##~~~~~~~~~~# Final model for time? (INTERACTION) --------------------------------
timemod3 <- glmer(response ~  qnum + geo + age.std + male0 + geo:age.std + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwait )
summary(timemod3)






### outputting to an html table: TIME MODELS

htmlreg(
  list(timemod4, timemod3), # list of models to include
  file = "within shuar time preferences main + intxn.doc",  # output filename
  stars = c(0.001, 0.01, 0.05),
  center = TRUE,                     # center on page
  digits = 2,                        # digits for coefs and standard errors
  naive = TRUE,
  single.row = FALSE,                # standard errors below coefs or on same line
  leading.zero = TRUE,
  custom.model.names = c("(1)", "(2)"), # model names
  inline.css = FALSE, doctype = TRUE, html.tag = TRUE, head.tag = TRUE, body.tag = TRUE
)



## Data viz of interaction
ageintegrationtime <- ggplot(data=longxwait, aes(y=response, x=age.std, color=geo)) + 
  stat_smooth(method=lm)
ageintegrationtime

## Simple Slopes analysis -----------

ss.old <- glmer(response ~  qnum + geo + old + male0 + geo:old + (1|pid), 
                family=binomial,
                glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                data=longxwait )
summary(ss.old)
# Coefficient for GEO is -0.425 for OLD

ss.young <- glmer(response ~  qnum + geo + young + male0 + geo:young + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                  data=longxwait )
summary(ss.young)
# Coefficient for GEO is 2.488 for YOUNG


 
# Risk ------------------------------------------------------------

riskmod <- glmer(response ~ qnum * age.std * geo + male0 + (1|pid), 
                 family=binomial,
                 glmerControl(optimizer="bobyqa", 
                              optCtrl = list(maxfun = 100000)),
                 data=longxrisk )
summary(riskmod)
drop1(riskmod,test="Chisq")

riskmod2 <- glmer(response ~  (qnum + geo + age.std)^2 + male0  + (1|pid), 
                  family=binomial,
                  glmerControl(optimizer="bobyqa", 
                               optCtrl = list(maxfun = 100000)),
                  data=longxrisk)
summary(riskmod2)
drop1(riskmod2,test="Chisq")

##~~~~~~~~~~# Final model for risk? (MAIN EFFECTS)--------------------------------
riskmod4 <- (glmer(response ~ qnum + geo + age.std + male0 +  (1|pid), 
                   family=binomial,
                   glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                   data=longxrisk ))
summary(riskmod4)

##~~~~~~~~~~# Final model for risk? (INTERACTION)--------------------------------
riskmod3 <- (glmer(response ~  qnum + geo + age.std + geo:age.std + male0 +  
                     (1|pid), family=binomial,
                   glmerControl(optimizer="bobyqa", optCtrl = list(maxfun = 100000)),
                   data=longxrisk ))
summary(riskmod3) 




### outputting to an html table: RISK MODELS

htmlreg(
  list(riskmod4, riskmod3), # list of models to include
  file = "within shuar risk preferences main + intxn.doc",  # output filename
  stars = c(0.001, 0.01, 0.05),
  center = TRUE,                     # center on page
  digits = 2,                        # digits for coefs and standard errors
  naive = TRUE,
  single.row = FALSE,                # standard errors below coefs or on same line
  leading.zero = TRUE,
  custom.model.names = c("(1)", "(2)"), # model names
  inline.css = FALSE, doctype = TRUE, html.tag = TRUE, head.tag = TRUE, body.tag = TRUE
)





## Data viz of interaction
ageintegrationrisk <- ggplot(data=longxrisk, aes(y=response, x=age.std, color=geo)) + 
  stat_smooth(method=lm)
ageintegrationrisk


### Predicted Effects: -----------------------------------

## Time Effects
library(effects)
effects1 <- allEffects(timemod3)
#, xlevels = list(qnum = seq(1, 5, by = 0.001)))
summary(effects1)
effects1_df <- lapply(effects1, as.data.frame)
mod.time.predicted <- effects1_df$`geo:age.std`
str(mod.time.predicted)


legendtitle <- "Region"
pd <- position_dodge(.1)
predicted.values.time <- ggplot(mod.time.predicted, aes(x=age.std, y=fit, color = geo)) + 
  geom_line(size = 1.5) +
  scale_color_manual(legendtitle, values = c("deepskyblue2", "red")) +
  geom_ribbon(data = mod.time.predicted, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = geo), 
              alpha = .3, linetype = 0) +
  scale_fill_manual(legendtitle, values = c("deepskyblue2", "red")) +
  scale_size_area() + 
  ylab("Response: Choosing Tomorrow") +
  xlab("Age")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))

## Time Graphic:
predicted.values.time
## Interaction between age & region


##-- Risk Effects

effects2 <- allEffects(riskmod3)
#, xlevels = list(qnum = seq(1, 5, by = 0.001)))
summary(effects2)
effects2_df <- lapply(effects2, as.data.frame)
mod.risk.predicted <- effects2_df$`geo:age.std`
str(mod.risk.predicted)

pd <- position_dodge(.1)
predicted.values.risk <- ggplot(mod.risk.predicted, aes(x=age.std, y=fit, color = geo)) + 
  geom_line(size = 1.5) +
  scale_color_manual(legendtitle, values = c("deepskyblue2", "red")) +
  geom_ribbon(data = mod.risk.predicted, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = geo), 
              alpha = .3, linetype = 0) +
  scale_fill_manual(legendtitle, values = c("deepskyblue2", "red")) +
  scale_size_area() + 
  ylab("Response: Choosing Risky Option")+
  xlab("Age")  +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))

## Risk Graphic:
predicted.values.risk
## interaction between age and region



#### Matching KS -------------------------------- 
library(Matching)

#### RISK
ks.boot(x$totalrisk[x$region == "Upano Valley"],x$totalrisk[x$region == "Cross Cutucu"], nboots = 500)

#### TIME
## Ecuador vs. Argentina
ks.boot(x$totaltomorrow[x$region == "Upano Valley"],x$totaltomorrow[x$region == "Cross Cutucu"], nboots = 500)

