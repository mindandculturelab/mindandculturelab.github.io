## Forgiveness Analysis
## Updated 9/16/20 -- Dorsa Amir


library(tidyverse)
library(lme4)
library(gridExtra)
library(texreg)
library(plyr)
library(effects)
library(Rmisc)
library(interactions)
library(lmerTest)
library(broom.mixed)

x <- read.csv("forgiveness_final_mar30.csv", header=TRUE)
str(x)



###### CLEANING & RECODING ######################


table(x$condition)

x$remorse1 <- x$condition
x$remorse1 <- gsub("IR", "1", x$remorse1)
x$remorse1 <- gsub("AR", "1", x$remorse1)
x$remorse1 <- gsub("ANR", "0", x$remorse1)
x$remorse1 <- gsub("INR", "0", x$remorse1)
x$remorse1 <- as.numeric(x$remorse1)

table(x$remorse1)

x$accident1 <- x$condition
x$accident1 <- gsub("IR", "0", x$accident1)
x$accident1 <- gsub("AR", "1", x$accident1)
x$accident1 <- gsub("ANR", "1", x$accident1)
x$accident1 <- gsub("INR", "0", x$accident1)
x$accident1 <- as.numeric(x$accident1)

x$notok1 <- gsub("not ok", "1", x$notok1)
x$notok1 <- gsub("ok", "0", x$notok1)
x$notok1 <- as.numeric(x$notok1)

x$recallintent1 <- x$recallintent
x$recallintent1 <- gsub("yes", "1", x$recallintent1)
x$recallintent1 <- gsub("no", "0", x$recallintent1)
x$recallintent1 <- as.numeric(x$recallintent1)

x$recallremorse1 <- x$recallremorse
x$recallremorse1 <- gsub("yes", "1", x$recallremorse1)
x$recallremorse1 <- gsub("no", "0", x$recallremorse1)
x$recallremorse1 <- as.numeric(x$recallremorse1)



x$condition.f <- factor(x$condition, levels = c("B", "AR","IR","ANR","INR"))

mean(x$exactage)
sd(x$exactage)
table(x$gender)
table(x$ageyears)

table(x$fcomp1)
table(x$fcomp2)

table(x$fcomp1, x$ageyears)
table(x$fcomp2, x$ageyears)

### RECALL DIFFERENCES ##


table(x$recallremorse1)
table(x$recallintent1)
mean(x$recallintent1, na.rm = T)
mean(x$recallremorse1, na.rm = T)
sd(x$recallintent1, na.rm = T)
sd(x$recallremorse1, na.rm = T)

table(x$recallremorse1, x$condition)
table(x$recallintent1, x$condition)

x.long <- x %>% 
  select(pid, recallintent1, recallremorse1) %>% 
  pivot_longer(-pid) %>% 
  as_tibble()

summary(recall.diff <- glmer(value ~ name + (1|pid), data = x.long, family=binomial))
broom.mixed::tidy(recall.diff, exponentiate=TRUE, conf.int=TRUE) %>% 
  mutate_if(is.numeric, round, 9)


### MODELS #######################################
## Looking at number given back with a GLM Poisson 

## Looking just at condition
### Supplement: main effects across condition
summary(m1 <- glm(givenback ~  exactage + condition.f + gender, 
                  family = "poisson", data = x))
### Supplement: age * condition
summary(m1.5 <- glm(givenback ~  exactage*condition.f + gender, 
                  family = "poisson", data = x))



### MAIN TEXT MODELS
### MS: main effects across intent & remorse
summary(m2 <- glm(givenback ~  exactage  +
                    accident1 + remorse1 + gender, 
                  family = "poisson", data = x))

### MS: interactive effects
summary(m4 <- glm(givenback ~ exactage*remorse1 + gender, 
                  family = "poisson", data = x))

summary(m5 <- glm(givenback ~ exactage*accident1 + gender, 
                  family = "poisson", data = x))


summary(m6 <- glm(givenback ~ exactage*gender, 
                  family = "poisson", data = x))

## Digging into age * intent interaction a bit more
## Repasting model
summary(m5 <- glm(givenback ~ exactage*accident1 + gender, 
                  family = "poisson", data = x))
## Simple slopes analysis
sim_slopes(m5, pred = exactage, modx =accident1, johnson_neyman = FALSE)

## Looking for age effects in baseline

justb <- x %>% filter(condition.f == "B")
summary(m7 <- glm(givenback ~ exactage, 
                  family = "poisson", data = justb))



## INTERACTION OF INTENT AND REMORSE
summary(m8 <- glm(givenback ~ remorse1*accident1 + gender + exactage, 
                  family = "poisson", data = x))
summary(m8.nointxn <- glm(givenback ~ remorse1 +accident1+ gender + exactage,  
                  family = "poisson", data = x))
anova(m8, m8.nointxn, test = "Chisq")

summary(m8.2 <- lm(givenback ~ remorse1*accident1, data = x))



summary(m9 <- glm(givenback ~ exactage*remorse1*accident1 + gender, 
                  family = "poisson", data = x))
drop1(m9,  test = "Chisq")
summary(m9.2 <- lm(givenback ~ remorse1*accident1*exactage, data = x))

### DATA VIZ ###################################


## data viz: number given back by condition
legendtitle <- "Condition"

x2 <- x
x2$condition <- gsub("ANR", "Accidental / No Remorse", x2$condition)
x2$condition <- gsub("INR", "Intentional / No Remorse", x2$condition)
x2$condition <- gsub("AR", "Accidental / Remorse", x2$condition)
x2$condition <- gsub("IR", "Intentional / Remorse", x2$condition)
x2$condition <- gsub("B", "Baseline", x2$condition)

## Density plot of pictures given back by condition
fig1 <- ggplot(x2, aes(x=x2$givenback), y=..scaled..) + 
  geom_density(aes(group=x2$condition, fill=x2$condition), size=0.1, alpha=0.4)  +
  scale_fill_manual(legendtitle, 
                    values = c("#B2182B","#D6604D", "#FDDBC7" ,"#4393C3" ,"#92C5DE")) +
  xlab("\n Number of Sheets Given Back") + ylab("Density \n") + 
  geom_hline(yintercept=0, colour="white", size=1) + ylim(0, 0.4) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
fig1


## Density plot of all choices, collapsed across conditions
fig1.1 <- ggplot(x2, aes(x=x2$givenback), y=..scaled..) + 
  geom_density(size=0.1, alpha=0.4, fill = "red")  +
  xlab("\n Number of pictures given back") + ylab("Density \n") + 
  geom_hline(yintercept=0, colour="white", size=1) + ylim(0, 0.35) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
fig1.1




summary <- summarySE(data = x,
                     measurevar = c("givenback"),
                     groupvars = c("ageyears", "condition"),
                     na.rm = TRUE)


summary2 <- summarySE(data = x,
                     measurevar = c("givenback"),
                     groupvars = c("ageyears", "accident1"),
                     na.rm = TRUE)


## means by condition
fit <- aov(givenback ~ condition.f, data = x)
summary(fit)
df <- ddply(x,~condition.f,summarise,mean=mean(givenback),sd=sd(givenback))

fig2 <- ggplot(df, aes(x=condition.f, y=mean)) + 
  geom_bar(stat = "identity", fill=c("#B2182B","#D6604D", "#FDDBC7" ,"#4393C3" ,"#92C5DE")) + 
  geom_errorbar(aes(ymin=mean-sd, ymax=mean+sd), width=.2,
                position=position_dodge(.9)) + 
  xlab("\n Condition") +
  ylab("Number given back (+/- SD) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=15, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica")) + ylim(0,7)
fig2


t.test(x$givenback, mu=2.5)
mean(x$givenback)
sd(x$givenback)



## means by remorse
fit <- aov(givenback ~ remorse1, data = x)
summary(fit)
df <- ddply(x,~remorse1,summarise,mean=mean(givenback),sd=sd(givenback))
## data viz: 
fig3 <- ggplot(df, aes(x=remorse1, y=mean, fill=remorse1)) + 
  geom_bar(stat = "identity") + 
  geom_errorbar(aes(ymin=mean-sd, ymax=mean+sd), width=.2,
                position=position_dodge(.9)) + 
  xlab("\n Condition") +
  ylab("Number given back (+/- SD) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=15, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
fig3


## data viz: number given back by remorse
x3 <- x
x3$remorse1 <- gsub("1", "Remorse", x3$remorse1)
x3$remorse1 <- gsub("0", "No Remorse", x3$remorse1)
x3$remorse1 <- gsub("NA", "Baseline", x3$remorse1)
fig4 <- ggplot(x3, aes(x=x3$givenback), y=..scaled..) + 
  geom_density(aes(group=x3$remorse1, fill=x3$remorse1), size=0.1, alpha=0.4)  +
  scale_fill_manual(legendtitle, 
                    values = c("pink","deepskyblue2", "aquamarine3", "mediumpurple2")) +
  xlab("\n Number of pictures given back") + ylab("Density \n") + 
  geom_hline(yintercept=0, colour="white", size=1) + ylim(0, 0.4) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica"))
fig4




#### DATA VIZ: PREDICTED EFFECTS: VISUALIZING INTERACTIONS ########


## Age and Remorse
x$Remorse <- as.factor(x$remorse1)
x$Remorse <- revalue(x$Remorse, c("0"="No Remorse", "1" = "Remorse"))
fit <- (glm(givenback ~ Remorse + exactage +
              exactage:Remorse, family = "poisson", data = x))
effects2 <- allEffects(fit)
summary(effects2)
effects2_df <- lapply(effects2, as.data.frame)
mod.predicted.2 <- effects2_df$`Remorse:exactage`
str(mod.predicted.2)

ageandremorse <- ggplot(mod.predicted.2, aes(x=exactage, y=fit, color = Remorse)) + 
  geom_line(size = 1.5) +
  geom_ribbon(data = mod.predicted.2, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = Remorse), 
              alpha = .2, linetype = 0) +
  scale_size_area() + 
  ylab("Predicted value (Sheets Given Back) \n")+
  xlab("\n Age")+
  theme_bw() +
  theme(text = element_text(size=15, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"),
        panel.border = element_blank()) +
  theme(text = element_text(size=15, family="Helvetica")) + ylim(0, 5) +
  scale_colour_manual(values = c("#ff1a75","#0099ff")) + 
  scale_fill_manual(values = c("#ff1a75","#0099ff"))
ageandremorse

## Remorse graphic
remorse.plot <- filter(x, !is.na(Remorse)) %>% 
  ggplot(aes(x=exactage, y=givenback, color = Remorse)) + 
  geom_smooth(aes(fill = Remorse), alpha = 0.2, method = "lm") +
  ylab("Sheets Given Back \n")+
  xlab("\n Age")+
  theme_bw() +
  theme(text = element_text(size=15, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"),
        panel.border = element_blank()) +
  theme(text = element_text(size=15, family="Helvetica")) + ylim(0, 5) + xlim(5,10) +
  scale_colour_manual(values = c("#ff1a75","#0099ff")) + 
  scale_fill_manual(values = c("#ff1a75","#0099ff")) + theme(legend.position = "none")
remorse.plot



## Age and Intention
x$Intent <- as.factor(x$accident1)
x$Intent <-  gsub("1", "Accidental", x$Intent)
x$Intent <-  gsub("0", "Intentional", x$Intent)

fit2 <- (glm(givenback ~ Intent + exactage +
              exactage:Intent, family = "poisson", data = x))

effects3 <- allEffects(fit2)
summary(effects3)
effects3_df <- lapply(effects3, as.data.frame)
mod.predicted.3 <- effects3_df$`Intent:exactage`
str(mod.predicted.3)

ageandintent <- ggplot(mod.predicted.3, aes(x=exactage, y=fit, color = Intent)) + 
  geom_line(size = 1.5) +
  geom_ribbon(data = mod.predicted.3, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = Intent), 
              alpha = .2, linetype = 0) +
  scale_size_area() + 
  xlab("\n Age")+
  theme_bw() +
  theme(text = element_text(size=15, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"), 
        panel.border = element_blank(), axis.title.y = element_blank()) +
  theme(text = element_text(size=15, family="Helvetica")) + ylim(0, 5) +
  scale_colour_manual(values = c("#0099ff", "#ff1a75")) + 
  scale_fill_manual(values = c("#0099ff", "#ff1a75")) 
ageandintent


## Intent graphic
intent.plot <- filter(x, !is.na(Intent)) %>% 
  ggplot(aes(x=exactage, y=givenback, color = Intent)) + 
  geom_smooth(aes(fill = Intent), alpha = 0.2, method = "lm") +
  ylab("Sheets Given Back \n")+
  xlab("\n Age")+
  theme_bw() +
  theme(text = element_text(size=15, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"),
        panel.border = element_blank()) +
  theme(text = element_text(size=15, family="Helvetica")) + ylim(0, 5) + xlim(5,10) +
  scale_colour_manual(values = c("#0099ff", "#ff1a75")) + 
  scale_fill_manual(values = c("#0099ff", "#ff1a75")) + theme(legend.position = "none")
intent.plot





## Two panel graphic
grid.arrange(remorse.plot,
             intent.plot, ncol=2)



## Age & condition

## Age and condition interaction
fit <- (glm(givenback ~ condition.f + ageyears +
              ageyears:condition.f, family = "poisson", data = x))
effects3 <- allEffects(fit)
summary(effects3)
effects3_df <- lapply(effects3, as.data.frame)
mod.predicted.2 <- effects3_df$`condition.f:ageyears`
str(mod.predicted.2)

ageandcondition <- ggplot(mod.predicted.2, aes(x=ageyears, y=fit, color = condition.f)) + 
  geom_line(size = 1.5) +
  geom_ribbon(data = mod.predicted.2, 
              mapping = aes(y = fit, ymin = lower, ymax = upper, fill = condition.f), 
              alpha = .08, linetype = 0) +
  scale_size_area() + 
  ylab("Predicted Value (Number of Sheets Given Back) \n") +
  xlab("\n Age") + theme_bw() +
  theme(text = element_text(size=15, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"), 
        panel.border = element_blank()) +
  theme(text = element_text(size=15, family="Helvetica")) + ylim(0, 5.8) +
  labs(color='Condition')  + guides(fill=FALSE)  +
  scale_fill_manual(legendtitle, 
                    values = c("#B2182B","#F4A582", "#666666" ,"#92C5DE" ,"#2166AC")) +
  scale_color_manual(values = c("#B2182B","#F4A582", "#666666" ,"#92C5DE" ,"#2166AC"))
ageandcondition
dev.off()

### ROBUSTNESS CHECK: RECALL RATE ###############

x$recallsum <- rowSums((x[26:27]))
table(x$recallsum)

## No main effects (controlling for recall), same as main model
summary(m8 <- glm(givenback ~  exactage  +
                    accident1 + remorse1 + gender + recallsum, 
                  family = "poisson", data = x))

## No interaction with remorse (controlling for recall), same as main model
summary(m9 <- glm(givenback ~ exactage*remorse1 + recallsum + gender, 
                  family = "poisson", data = x))

## Interaction with intent holds up (controlling for recall), same as main model
summary(m10 <- glm(givenback ~ exactage*accident1 + recallsum + gender, 
                  family = "poisson", data = x))



### Supplement: Making sure age doesn't vary by condition
summary(aov(exactage ~ condition.f, data = x))


#### ROBUSTNESS CHECK: LOCATIONS ############

table(x$location)
table(x$condition, x$location)


### main effects
## repasting this
summary(m2 <- glm(givenback ~  exactage  +
                    accident1 + remorse1 + gender, 
                  family = "poisson", data = x))
summary(m10 <- glm(givenback ~  exactage  +
                    accident1 + remorse1 + gender + location, 
                  family = "poisson", data = x))
anova(m2, m10, test = "Chisq")
# no reason to retain location in main effects model

### interactions

## repasting these for anovas
summary(m3 <- glm(givenback ~ exactage*condition.f + gender, 
                  family = "poisson", data = x))
summary(m11 <- glm(givenback ~ exactage*condition.f + gender + location, 
                   family = "poisson", data = x))
anova(m3, m11, test = "Chisq")
# no reason to retain location in interaction model


summary(m4 <- glm(givenback ~ exactage*remorse1 + gender, 
                  family = "poisson", data = x))
summary(m12 <- glm(givenback ~ exactage*remorse1 + gender + location, 
                   family = "poisson", data = x))
anova(m4, m12, test = "Chisq")
# no reason to retain location in interaction model


summary(m5 <- glm(givenback ~ exactage*accident1 + gender, 
                  family = "poisson", data = x))
summary(m13 <- glm(givenback ~ exactage*accident1 + gender + location, 
                   family = "poisson", data = x))
anova(m5, m13, test = "Chisq")
# no reason to retain location in interaction model


agebylocation <- aov(exactage ~ location, data = x)
summary(agebylocation)

#### ROBUSTNESS CHECK: COMPREHENSION ############

table(x$fcomp1)
x$fcomp1.f <- factor(x$fcomp1, levels = c("SC","CWE1","CWE2", "I"))
x$fcomp1.n <- as.numeric(x$fcomp1.f)

table(x$fcomp2)
x$fcomp2.f <- factor(x$fcomp2, levels = c("SC","CWE1", "I"))
x$fcomp2.n <- as.numeric(x$fcomp2.f)

x$fcomptotal <- x$fcomp1.n + x$fcomp2.n
table(x$fcomptotal)

### main effects
## repasting this
summary(m2 <- glm(givenback ~  exactage  +
                    accident1 + remorse1 + gender, 
                  family = "poisson", data = x))
summary(m14 <- glm(givenback ~  exactage  +
                     accident1 + remorse1 + gender + fcomptotal, 
                   family = "poisson", data = x))
anova(m2, m14,  test = "Chisq")
# No reason to retain comprehrension variable 


### interactions

## repasting these for anovas

summary(m4 <- glm(givenback ~ exactage*remorse1 + gender, 
                  family = "poisson", data = x))
summary(m15 <- glm(givenback ~ exactage*remorse1 + gender + fcomptotal, 
                   family = "poisson", data = x))
anova(m4, m15, test = "Chisq")
# No reason to retain comprehrension variable 


summary(m5 <- glm(givenback ~ exactage*accident1 + gender, 
                  family = "poisson", data = x))
summary(m16 <- glm(givenback ~ exactage*accident1 + gender + fcomptotal, 
                   family = "poisson", data = x))
anova(m5, m16, test = "Chisq")
# No reason to retain comprehrension variable 



#### EXPLORING JUDGMENTS #############

x$judgment.f <- factor(x$judgment,
                       levels = c("very, very good", "pretty good",
                                  "a little good", "a little bad",
                                  "pretty bad", "very, very bad"))

x$judgment.numeric <- as.numeric(x$judgment.f)

x %>% 
  group_by(condition.f) %>% 
  dplyr::summarize(judgment= mean(judgment.numeric, na.rm=T),
                   sd = sd(judgment.numeric, na.rm=T))

judgmentbycondition <- ggplot(x, aes(y = judgment.numeric, 
                               x = condition.f)) +
  geom_boxplot(fill=c("#B2182B","#D6604D", "#FDDBC7" ,"#4393C3" ,"#92C5DE"),
               fatten = 4) +
  scale_y_continuous(breaks = c(1,2,3,4,5,6)) +
  ylab("Badness of Transgressor's Actions \n") + theme_gray() + #guides(fill=FALSE) +
  xlab("\n Condition") +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica"))
judgmentbycondition 

judgmentbyremorse <- filter(x, !is.na(Remorse)) %>% 
  ggplot(aes(y = judgment.numeric, 
             x = Remorse)) +
  geom_boxplot(fill =  c("#ff1a75", "#0099ff"), alpha = 0.4, fatten = 4) +
  scale_y_continuous(breaks = c(1,2,3,4,5,6)) +
  ylab("Badness of Transgressor's Actions \n") + theme_gray() + #guides(fill=FALSE) +
  xlab("\n Remorse") +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica"))  
judgmentbyremorse

judgmentbyintent <- filter(x, !is.na(Intent)) %>% 
  ggplot(aes(y = judgment.numeric, 
             x = Intent)) +
  geom_boxplot(fill =  c("#ff1a75", "#0099ff"), alpha = 0.4, fatten = 4) +
  scale_y_continuous(breaks = c(1,2,3,4,5,6)) +
  ylab("Badness of Transgressor's Actions \n") + theme_gray() + #guides(fill=FALSE) +
  xlab("\n Intent") +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica"))  
judgmentbyintent


summary(judgemod <- lm(judgment.numeric ~ condition.f, data = x))
summary(judgemod2 <- lm(judgment.numeric ~ exactage + condition.f, data = x))


x$judgment.goodorbad <- x$judgment.numeric
x$judgment.goodorbad <-  gsub("6", "Bad", x$judgment.goodorbad)
x$judgment.goodorbad <-  gsub("5", "Bad", x$judgment.goodorbad)
x$judgment.goodorbad <-  gsub("4", "Bad", x$judgment.goodorbad)
x$judgment.goodorbad <-  gsub("3", "Good", x$judgment.goodorbad)
x$judgment.goodorbad <-  gsub("2", "Good", x$judgment.goodorbad)
x$judgment.goodorbad <-  gsub("1", "Good", x$judgment.goodorbad)
table(x$judgment.goodorbad)

table(x$notok1)

notok.summary <- summarySE(data = x, na.rm = TRUE,
                         measurevar = "notok1",
                         groupvars = c("condition.f"))

notok.means <- ggplot(notok.summary, aes(x=condition.f, y=notok1, fill=condition.f)) + 
  geom_errorbar(aes(ymin=notok1-se, ymax=notok1+se), width=.2,
                position=position_dodge(.9)) + 
  geom_bar(stat = "identity", fill=c("#B2182B","#D6604D", "#FDDBC7" ,"#4393C3" ,"#92C5DE")) + 
  xlab("\n Condition") +
  ylab("Proportion Saying Action 'Not Okay' (+/- SE) \n") + theme_gray() +
  guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,1) 
notok.means



summary(judg.and.behavior  <- glm(givenback ~  judgment.numeric, 
                                  family = "poisson", data = x))


summary(judg.and.behavior.age  <- glm(givenback ~  judgment.numeric*exactage, 
                                  family = "poisson", data = x))



judgmentbygivenback <- filter(x, !is.na(judgment.f)) %>% 
  ggplot( aes(x =  judgment.f , 
                y = givenback)) +
  geom_boxplot(fill=c("#B2182B","#86b879", "#c5dbbf" ,"#ebbdb0" ,"#de8066", "#cf3a11"),
                   fatten = 4) +
  xlab("\n Badness of Transgressor's Actions") + theme_gray() + guides(fill=FALSE) +
  ylab("Number of Sheets Returned \n") +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) 
judgmentbygivenback

## outputting  models into table
htmlreg(
  list(m2, m4, m5, m8, m9), # list of models to include
  file = "five models for table.doc",  # output filename
  stars = c(0.001, 0.01, 0.05),
  center = TRUE,                     # center on page
  digits = 2,                        # digits for coefs and standard errors
  naive = TRUE,
  single.row = FALSE,                # standard errors below coefs or on same line
  leading.zero = TRUE,
  custom.model.names = c("Model 1", "Model 2", "Model 3", "Model 4", "Model 5"), # model names
  inline.css = FALSE, doctype = TRUE, html.tag = TRUE, head.tag = TRUE, body.tag = TRUE
)

