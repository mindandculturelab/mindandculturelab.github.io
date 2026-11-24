## Social comparisons & ladder analysis
library(tidyverse)
library(gridExtra)

x <- read.csv("india_one_week.csv", header=TRUE)

summary(lm(test ~ retest, data = x))
cor.test(x$test, x$retest)

oneweek <- ggplot(data=x, aes(y=test, x=retest)) + 
  stat_smooth(method=lm, color = "black", fill = "aquamarine3") + ylim(1, 10) + xlim(1,10) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=12, family="Helvetica")) + 
  ylab("MacArthur Ladder Rung: Time 1") +
  xlab("MacArthur Ladder Rung: Time 2 \n\n Within One Week")
oneweek




y <- read.csv("india_one_year.csv", header=TRUE)
cor.test(y$test, y$retest)

table(y$gender1)

oneyear <- ggplot(data=y, aes(y=test, x=retest)) + 
  stat_smooth(method=lm, color = "black", fill = "aquamarine3") + ylim(1, 10) + xlim(1,10) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=12, family="Helvetica")) + 
  ylab("MacArthur Ladder Rung: Time 1") +
  xlab("MacArthur Ladder Rung: Time 2 \n\n After One Year")
oneyear


grid.arrange(oneweek, oneyear, ncol=2)

t.test(y$test, y$retest, paired=TRUE)

mean(y$test)
sd(y$test)
mean(y$retest)
sd(y$retest)
