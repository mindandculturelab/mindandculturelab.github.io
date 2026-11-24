## Study of Trust And Generosity (STAG) Final Analysis
## Dorsa Amir, Updated March 2021


library(tidyverse)
library(Rmisc)
library(patchwork)
library(needs)
library(broom)
library(lme4)
prioritize(dplyr)


### DATA CLEANING & CODING ########-----------------------------------------------------

x <- read.csv("stag_final_aug21.csv", header=TRUE)
str(x)

table(x$condition)
x$condition <- gsub("standard", "trustworthiness", x$condition)

# first of all, there's almost never a need to 
# save summary tibbles in tidyverse; just pass
# the results into the plot or join with main
# tibble

trust.summary <- summarySE(data = x, na.rm = TRUE,
                           measurevar = "numbershared",
                           groupvars = c("condition"))
trust.summary

x %>%
  summarise_at("exactage", 
               list(mean = mean, sd = sd),
               na.rm = T)

x %>% 
  group_by(gender) %>% 
  summarise(obs = n())



table(x$gender)



## MODELS #######-------------------------------------------------------------------
t.test(x$numbershared ~ x$condition)
summary(mod1 <- lm(numbershared ~ condition, data = x))

## MOD2: MAIN MODEL
summary(mod2 <- lm(numbershared ~ condition + exactage, data = x))

## EXPLORATORY ANALYSES
summary(mod3 <- lm(numbershared ~ condition*exactage, data = x))
drop1(mod3, test = "Chisq")
## Gender
summary(mod5 <- lm(numbershared ~ condition + gender*exactage, data = x))
drop1(mod5, test = "Chisq")
summary(mod4 <- lm(numbershared ~ condition + exactage + gender, data = x))
summary(mod6 <- lm(numbershared ~ condition*gender + exactage, data = x))

stag.gender.summary <- summarySE(data = x, na.rm = TRUE,
                       measurevar = "numbershared",
                       groupvars = c("condition", "gender"))



## DATA VIZ ######------------------------------------------------------------------

# means by condition, main plot
trustmeans <- ggplot(trust.summary, aes(x=condition, y=numbershared, fill=condition)) + 
  geom_errorbar(aes(ymin=numbershared-se, ymax=numbershared+se), width=.2,
                position=position_dodge(.9)) + 
  geom_bar(stat = "identity") + 
  xlab("\n Condition") +
  ylab("Number of Candies Shared (+/- SE) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,6) +
  annotate("text", x = 1.5, y = 4.5, size = 5, label = "p = 0.002**") +
  geom_segment(aes(x=1, xend=2, y=4, yend=4)) +
  scale_fill_manual(values = c("#54ACE9","#F0576B"))
trustmeans

trustmeans2 <- ggplot(trust.summary, aes(x=condition, y=numbershared, color=condition)) + 
  geom_pointrange(aes(ymin = numbershared - ci, ymax = numbershared + ci),
                  position = position_dodge(0.5), size =1) +
  xlab("\n Condition") +
  ylab("Number of Candies Shared (+/- SE) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,6) +
  theme(legend.position = "none") 
trustmeans2



# main effect of gender by condition, supplement
stag.gender <- ggplot(stag.gender.summary, aes(x=condition, y=numbershared, fill=gender)) + 
  geom_bar(stat="identity",position="dodge") +
 geom_errorbar(aes(ymin=numbershared-se, ymax=numbershared+se), width=.2,
             position=position_dodge(.9)) + 
  xlab("\n Condition") +
  ylab("Number of Starbursts Shared\n") + theme_gray() +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,6)
stag.gender



stag.gender2 <- ggplot(stag.gender.summary, aes(x=condition, y=numbershared, color=gender)) + 
  geom_pointrange(aes(ymin = numbershared - ci, ymax = numbershared + ci),
                  position = position_dodge(0.5), size =1) +
  xlab("\n Condition") +
  ylab("Number of Starbursts Shared\n") + theme_gray() +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,6) 
stag.gender2



# condition & age, supplement
trust.age <- ggplot(x, aes(x=exactage, y=numbershared, fill = condition)) + 
  geom_smooth(aes(colour=condition), method = "lm") +
  xlab("\n Age") +
  ylab("Number of Starbursts Shared \n") + theme_gray() +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,6) +
  scale_fill_manual(values = c("#54ACE9","#F0576B")) +
  scale_color_manual(values = c("#54ACE9","#F0576B"))
trust.age


## ROBUSTNESS CHECK: LOCATION #######-------------------------------------------------

table(x$location)
table(x$condition, x$location)

## repasting & comparing model
summary(mod1 <- lm(numbershared ~ condition, data = x))
summary(mod6 <- lm(numbershared ~ condition + location, data = x))
anova(mod1, mod6, test = "Chisq")

agebylocation <- aov(exactage ~ location, data = x)
summary(agebylocation)
boxplot(x$exactage ~ x$location)


## Comprehension questions #######-------------------------------------------------
table(x$comp1) # 110/118 = 93% SC
table(x$comp2) # 116/118 = 98% SC
table(x$comp3) # 117/118 = 99% SC
table(x$comp4) # 115/118 97% SC
table(x$comp5) # 57/60 = 95% SC (one I)
table(x$comp6) # 55/60 = 92%
table(x$comp7) # 116/118 = 98%
table(x$comp8) # 114/118 = 97%
## Overall average: 769/8 = 96%
## I: 1/721 = 0.001%

## Free Response Question #######-------------------------------------------------


x %>%
  filter(!is.na(expectation)) %>% 
  group_by(condition) %>% 
  select(expectation) %>% 
  tally()

x %>%
  group_by(gender) %>% 
  summarise_at("expectation", 
               list(mean = mean, sd = sd),
               na.rm = T)

t.test(x$expectation ~ x$gender)

table(x$expectation)

x %>%
  select(cat.expectation) %>% 
  count()

boxplot(x$expectation ~ x$condition)
t.test(x$expectation ~ x$condition)

x %>%
  group_by(condition) %>% 
  summarise_at("expectation", 
               list(mean = mean, sd = sd),
               na.rm = T)


summary(lm(expectation ~ gender*condition, data = x))
summary(lm(expectation ~ gender + condition, data = x))
summary(lm(expectation ~ gender , data = x))
summary(lm(expectation ~ exactage , data = x))



expect.summary <- summarySE(data = x, na.rm = TRUE,
                                 measurevar = "expectation",
                                 groupvars = c("condition"))

expect.means <- ggplot(expect.summary, aes(x=condition, y=expectation, fill=condition)) + 
  geom_errorbar(aes(ymin=expectation-se, ymax=expectation+se), width=.2,
                position=position_dodge(.9)) + 
  geom_bar(stat = "identity") + 
  xlab("\n Condition") +
  ylab("Number of Candies Expected (+/- SE) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,6) +
  annotate("text", x = 1.5, y = 5, size = 5, label = "p = 0.005**") +
  geom_segment(aes(x=1, xend=2, y=4.5, yend=4.5)) +
  scale_fill_manual(values = c("#54ACE9","#F0576B"))
expect.means

expect.gender.summary <- summarySE(data = x, na.rm = TRUE,
                             measurevar = "expectation",
                             groupvars = c("gender", "condition"))

expect.means.gender <- ggplot(expect.gender.summary, aes(x=gender, y=expectation, fill=gender)) + 
  geom_errorbar(aes(ymin=expectation-se, ymax=expectation+se), width=.2,
                position=position_dodge(.9)) + 
  geom_bar(stat = "identity") + 
  xlab("\n Gender") +
  ylab("Number of Candies Expected (+/- SE) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,6) +
  scale_fill_manual(values = c("pink","sky blue")) +
  facet_wrap(~condition)
expect.means.gender


expect.age.summary <- summarySE(data = x, na.rm = TRUE,
                                   measurevar = "expectation",
                                   groupvars = c("ageyears"))

expect.means.age <- ggplot(expect.age.summary, aes(x=ageyears, y=expectation, fill=ageyears)) + 
  geom_errorbar(aes(ymin=expectation-se, ymax=expectation+se), width=.2,
                position=position_dodge(.9)) + 
  geom_bar(stat = "identity") + 
  xlab("\n Age") +
  ylab("Number of Candies Expected (+/- SE) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,6)
expect.means.age

expect.means.age.cont <- ggplot(x, aes(x=exactage, y=expectation)) + 
  #geom_errorbar(aes(ymin=expectation-se, ymax=expectation+se), width=.2,
               # position=position_dodge(.9)) + 
  geom_smooth(method = "lm") +
  xlab("\n Age") +
  ylab("Number of Candies Expected (+/- SE) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,6)
expect.means.age.cont

## Expected vs. actual behavior 

truncated.x <- x[x$expectation >= 0,]

truncated.x %>% 
  select(pid, expectation, numbershared) %>% 
  pivot_longer(-pid,   values_drop_na = T) %>% 
  do(tidy(lmer(value ~ name + (1|pid), data = .)))
# Significant difference between actual shared and expected

## Expected vs. actual behavior by age

x$difference <- x$numbershared - x$expectation
table(x$difference, x$ageyears)

t.test(x$difference ~ x$condition) 




expect.difference.summary <- summarySE(data = x, na.rm = TRUE,
                                   measurevar = "difference",
                                   groupvars = c("ageyears"))

expect.actual.byage <- ggplot(expect.difference.summary, aes(x=ageyears, y=difference)) + 
  geom_errorbar(aes(ymin=difference-se, ymax=difference+se), width=.2,
              position=position_dodge(.9)) + 
  geom_bar(stat = "identity") +
  xlab("\n Age") +
  ylab("Difference Between Actual & Expected (+/- SE) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) 
expect.actual.byage


expect.difference.gender.summary <- summarySE(data = x, na.rm = TRUE,
                                       measurevar = "difference",
                                       groupvars = c("gender"))

expect.actual.bygender <- ggplot(expect.difference.gender.summary, aes(x=gender, y=difference)) + 
  geom_errorbar(aes(ymin=difference-se, ymax=difference+se), width=.2,
                position=position_dodge(.9)) + 
  geom_bar(stat = "identity") +
  xlab("\n Gender") +
  ylab("Difference Between Actual & Expected (+/- SE) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) 
expect.actual.bygender

t.test(x$difference ~ x$gender) 

expect.difference.condition.summary <- summarySE(data = x, na.rm = TRUE,
                                              measurevar = "difference",
                                              groupvars = c("condition"))

expect.actual.bycondition <- ggplot(expect.difference.condition.summary, 
                                    aes(x=condition, y=difference)) + 
  geom_errorbar(aes(ymin=difference-se, ymax=difference+se), width=.2,
                position=position_dodge(.9)) + 
  geom_bar(stat = "identity") +
  xlab("\n Condition") +
  ylab("Difference Between Actual & Expected (+/- SE) \n") + theme_gray() + guides(fill=FALSE) +
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) 
expect.actual.bycondition


t.test(x$difference ~ x$condition) 



#### A FEW MORE SUPPLEMENTARY FIGURES & STATS

## Density plot of children's expectations of sharing by condition
expect.density.bycondition <- ggplot(x, aes(x=expectation), y=..scaled..) + 
  geom_density(aes(group=condition, fill=condition), size=0.1, alpha=0.4) +
  xlab("\n Expectation") +
  ylab("Density \n") + theme_gray() + 
  theme(text = element_text(size=19, family="Helvetica")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=19, family="Helvetica")) + ylim(0,0.5) +
  scale_fill_manual(values = c("#54ACE9","#F0576B"))
expect.density.bycondition

summary(lm( numbershared ~ expectation , data = x))

