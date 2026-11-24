## Social comparisons & ladder analysis
## Updated Nov 7, 2019


x <- read.csv("sesladder.csv", header=TRUE)


library(tidyverse)
library(psych)
library(lme4)
library(texreg)
library(reshape2)
library(gridExtra)



## Dummy coding gender
x$male0 <- x$sex
x$male0 <- gsub("M", "0", x$male0)
x$male0 <- gsub("F", "1", x$male0)
x$male0 <- as.numeric(x$male0)


describe.by(x$age, x$country)
table(x$male0, x$country)

counts <- table(x$age)
barplot(counts, main="All Groups: Age Frequencies",
        xlab="Age")

## Factoring & releveling country to compare to USA
x$country.f <- factor(x$country, 
                      levels = c( "USA", "Upano Valley", "India", "Argentina", "Cross Cutucu"))


## Scarcity Measures ------------------------------------------------------

# ---- MacArthur Ladder
hist(x$stairs)


# ---- Social Comparison (Compared to other families, do you have more/less/worse)
x[8:11] <- sapply(x[8:11],as.numeric)
x$soccomp <- rowSums(x[8:11])
str(x$soccomp)
hist(x$soccomp)

psych::alpha(x[8:11]) ## alpha is 0.7

# Correlation matrix for each item to each item & stairs
corrmatrix <- x %>%
  dplyr::select(Qfood, Qhouse, Qmoney, 
                Qthings, stairs)


corrmatrix <- corrmatrix %>% 
  dplyr::rename(Money = Qmoney , Ladder = stairs, Food = Qfood, 
                Things = Qthings, House = Qhouse)

cormat <- round(cor(corrmatrix[1:5],use='pairwise.complete.obs'),2)
melted_cormat <- melt(cormat)
head(melted_cormat)

matrixviz <- ggplot(data = melted_cormat, aes(x=Var1, y=Var2, fill=value)) + 
  geom_tile()
matrixviz

## making heatmap nicer
get_lower_tri<-function(cormat){
  cormat[upper.tri(cormat)] <- NA
  return(cormat)
}
get_upper_tri <- function(cormat){
  cormat[lower.tri(cormat)]<- NA
  return(cormat)
}

upper_tri <- get_upper_tri(cormat)
upper_tri

melted_cormat <- melt(upper_tri, na.rm = TRUE)

## nicer matrix data viz
matrixviz2 <- ggplot(data = melted_cormat, aes(Var2, Var1, fill = value))+
  geom_tile(color = "white")+
  scale_fill_gradient2(low = "blue", high = "#ff3377", mid = "white", 
                       midpoint = 0, limit = c(0,1), space = "Lab", 
                       name="Pearson\nCorrelation") +
  theme_minimal()+ 
  coord_fixed()+
  theme(text = element_text(size=12, family="Helvetica")) +
  geom_text(aes(Var2, Var1, label = value), color = "black", size = 4) +
  theme(text = element_text(size=12, family="Helvetica"),
        axis.title.x = element_blank(),
        axis.title.y = element_blank(),
        legend.position = "none")
matrixviz2 


#### Correlation matrices by country

## (varible names are reused so run code by country)

corrmatrix2 <- x %>%
  dplyr::select(Qfood, Qhouse, Qmoney, 
                Qthings, stairs, country.f)


## Argentina
corrargentina <- corrmatrix2[corrmatrix2$country.f=="Argentina",]


corrargentina <- corrargentina %>% 
  dplyr::rename(Money = Qmoney , Ladder = stairs, Food = Qfood, 
                Things = Qthings, House = Qhouse)

cormat <- round(cor(corrargentina[1:5],use='pairwise.complete.obs'),2)
melted_cormat <- melt(cormat)
head(melted_cormat)

## making heatmap nicer
get_lower_tri<-function(cormat){
  cormat[upper.tri(cormat)] <- NA
  return(cormat)
}
get_upper_tri <- function(cormat){
  cormat[lower.tri(cormat)]<- NA
  return(cormat)
}

upper_tri <- get_upper_tri(cormat)
upper_tri

melted_cormat <- melt(upper_tri, na.rm = TRUE)

## nicer matrix data viz
matrixvizarg <- ggplot(data = melted_cormat, aes(Var2, Var1, fill = value))+
  geom_tile(color = "white")+
  scale_fill_gradient2(low = "blue", high = "#ff3377", mid = "white", 
                       midpoint = 0, limit = c(-1,1), space = "Lab", 
                       name="Pearson\nCorrelation") +
  theme_minimal()+ 
  coord_fixed()+
  theme(text = element_text(size=12, family="Helvetica")) +
  geom_text(aes(Var2, Var1, label = value), color = "black", size = 4) +
  theme(text = element_text(size=12, family="Helvetica"),
        axis.title.x = element_blank(),
        axis.title.y = element_blank(),
        legend.position = "none")
matrixvizarg 



## USA
corrusa <- corrmatrix2[corrmatrix2$country.f=="USA",]


corrusa <- corrusa %>% 
  dplyr::rename(Money = Qmoney , Ladder = stairs, Food = Qfood, 
                Things = Qthings, House = Qhouse)

cormat <- round(cor(corrusa[1:5],use='pairwise.complete.obs'),2)
melted_cormat <- melt(cormat)
head(melted_cormat)

## making heatmap nicer
get_lower_tri<-function(cormat){
  cormat[upper.tri(cormat)] <- NA
  return(cormat)
}
get_upper_tri <- function(cormat){
  cormat[lower.tri(cormat)]<- NA
  return(cormat)
}

upper_tri <- get_upper_tri(cormat)
upper_tri

melted_cormat <- melt(upper_tri, na.rm = TRUE)

## nicer matrix data viz
matrixvizusa <- ggplot(data = melted_cormat, aes(Var2, Var1, fill = value))+
  geom_tile(color = "white")+
  scale_fill_gradient2(low = "blue", high = "#ff3377", mid = "white", 
                       midpoint = 0, limit = c(-1,1), space = "Lab", 
                       name="Pearson\nCorrelation") +
  theme_minimal()+ 
  coord_fixed()+
  theme(text = element_text(size=12, family="Helvetica")) +
  geom_text(aes(Var2, Var1, label = value), color = "black", size = 4) +
  theme(text = element_text(size=12, family="Helvetica"),
        axis.title.x = element_blank(),
        axis.title.y = element_blank(),
        legend.position = "none")
matrixvizusa 


## India
corruindia <- corrmatrix2[corrmatrix2$country.f=="India",]


corruindia <- corrusa %>% 
  dplyr::rename(Money = Qmoney , Ladder = stairs, Food = Qfood, 
                Things = Qthings, House = Qhouse)

cormat <- round(cor(corrusa[1:5],use='pairwise.complete.obs'),2)
melted_cormat <- melt(cormat)
head(melted_cormat)

## making heatmap nicer
get_lower_tri<-function(cormat){
  cormat[upper.tri(cormat)] <- NA
  return(cormat)
}
get_upper_tri <- function(cormat){
  cormat[lower.tri(cormat)]<- NA
  return(cormat)
}

upper_tri <- get_upper_tri(cormat)
upper_tri

melted_cormat <- melt(upper_tri, na.rm = TRUE)

## nicer matrix data viz
matrixvizindia <- ggplot(data = melted_cormat, aes(Var2, Var1, fill = value))+
  geom_tile(color = "white")+
  scale_fill_gradient2(low = "blue", high = "#ff3377", mid = "white", 
                       midpoint = 0, limit = c(-1,1), space = "Lab", 
                       name="Pearson\nCorrelation") +
  theme_minimal()+ 
  coord_fixed()+
  theme(text = element_text(size=12, family="Helvetica")) +
  geom_text(aes(Var2, Var1, label = value), color = "black", size = 4) +
  theme(text = element_text(size=12, family="Helvetica"),
        axis.title.x = element_blank(),
        axis.title.y = element_blank(),
        legend.position = "none")
matrixvizindia


## Cross Cutucu
corrcc <- corrmatrix2[corrmatrix2$country.f=="Cross Cutucu",]


corrcc <- corrcc %>% 
  dplyr::rename(Money = Qmoney , Ladder = stairs, Food = Qfood, 
                Things = Qthings, House = Qhouse)

cormat <- round(cor(corrcc[1:5],use='pairwise.complete.obs'),2)
melted_cormat <- melt(cormat)
head(melted_cormat)

## making heatmap nicer
get_lower_tri<-function(cormat){
  cormat[upper.tri(cormat)] <- NA
  return(cormat)
}
get_upper_tri <- function(cormat){
  cormat[lower.tri(cormat)]<- NA
  return(cormat)
}

upper_tri <- get_upper_tri(cormat)
upper_tri

melted_cormat <- melt(upper_tri, na.rm = TRUE)


matrixvizcc <- ggplot(data = melted_cormat, aes(Var2, Var1, fill = value))+
  geom_tile(color = "white")+
  scale_fill_gradient2(low = "blue", high = "#ff3377", mid = "white", 
                       midpoint = 0, limit = c(-1,1), space = "Lab", 
                       name="Pearson\nCorrelation") +
  theme_minimal()+ 
  coord_fixed()+
  theme(text = element_text(size=12, family="Helvetica")) +
  geom_text(aes(Var2, Var1, label = value), color = "black", size = 4) +
  theme(text = element_text(size=12, family="Helvetica"),
        axis.title.x = element_blank(),
        axis.title.y = element_blank(),
        legend.position = "none")
matrixvizcc



## Upano Valley
corruv <- corrmatrix2[corrmatrix2$country.f=="Upano Valley",]


corruv <- corruv %>% 
  dplyr::rename(Money = Qmoney , Ladder = stairs, Food = Qfood, 
                Things = Qthings, House = Qhouse)

cormat <- round(cor(corruv[1:5],use='pairwise.complete.obs'),2)
melted_cormat <- melt(cormat)
head(melted_cormat)

## making heatmap nicer
get_lower_tri<-function(cormat){
  cormat[upper.tri(cormat)] <- NA
  return(cormat)
}
get_upper_tri <- function(cormat){
  cormat[lower.tri(cormat)]<- NA
  return(cormat)
}

upper_tri <- get_upper_tri(cormat)
upper_tri

melted_cormat <- melt(upper_tri, na.rm = TRUE)


## nicer matrix data viz
matrixvizuv <- ggplot(data = melted_cormat, aes(Var2, Var1, fill = value))+
  geom_tile(color = "white")+
  scale_fill_gradient2(low = "blue", high = "#ff3377", mid = "white", 
                       midpoint = 0, limit = c(-1,1), space = "Lab", 
                       name="Pearson\nCorrelation") +
  theme_minimal()+ 
  coord_fixed()+
  theme(text = element_text(size=12, family="Helvetica")) +
  geom_text(aes(Var2, Var1, label = value), color = "black", size = 4) +
  theme(text = element_text(size=12, family="Helvetica"),
        axis.title.x = element_blank(),
        axis.title.y = element_blank(),
        legend.position = "none")
matrixvizuv

## all graphics
grid.arrange(matrixvizuv,
             matrixvizcc,
             matrixvizindia,
             matrixvizusa,
             matrixvizarg,
             matrixviz2, ncol=3)



## correlation for each item indvidually
cor(x$stairs,x$Qfood,use='pairwise.complete.obs')
cor(x$stairs,x$Qhouse,use='pairwise.complete.obs')
cor(x$stairs,x$Qmoney,use='pairwise.complete.obs')
cor(x$stairs,x$Qthings,use='pairwise.complete.obs')

# just in cross-cutucu
x2 <- filter(x,country=='Cross Cutucu')
cor(x2$stairs,x2$Qfood,use='pairwise.complete.obs')
cor(x2$stairs,x2$Qhouse,use='pairwise.complete.obs')
cor(x2$stairs,x2$Qmoney,use='pairwise.complete.obs')
cor(x2$stairs,x2$Qthings,use='pairwise.complete.obs')
psych::alpha(x2[8:11]) ## alpha is 0.67

# alphas for each country
x %>%
  split(.$country) %>%
  map(~psych::alpha(.x[8:11]))



## Models ------------------------------------------------------

x$country.f <- factor(x$country, 
                      levels = c( "USA", "Upano Valley", "India", "Argentina", "Cross Cutucu"))

### Social comparisons and stairs
## . Social comparisons (USA as baseline)
summary(lm(stairs ~ soccomp*country.f, data=x))
drop1(lm(stairs ~ soccomp*country.f, data=x),test='Chisq')

summary(lm(stairs ~ soccomp + country.f, data=x))
summary(lme4::lmer(stairs ~ soccomp + (1|country.f), data=x))


## Final models? ======
mod1 <- lm(stairs ~ soccomp + country.f , data=x)
summary(mod1)

mod2 <- lm(stairs ~ soccomp*country.f + soccomp + country.f  , data=x)
summary(mod2)
## ======



# correlations separately for each country
x %>%
  split(.$country) %>%
  map(~cor(.x$stairs,.x$soccomp,use='pairwise.complete.obs'))


# separately for each Q in soccomp, pretty noisy probably not helpful
x %>%
  split(.$country) %>%
  map(~cor(.x$stairs,.x$Qmoney,use='pairwise.complete.obs'))
x %>%
  split(.$country) %>%
  map(~cor(.x$stairs,.x$Qhouse,use='pairwise.complete.obs'))
x %>%
  split(.$country) %>%
  map(~cor(.x$stairs,.x$Qthings,use='pairwise.complete.obs'))
x %>%
  split(.$country) %>%
  map(~cor(.x$stairs,.x$Qfood,use='pairwise.complete.obs'))


## Computing difference scores 

x$soccomp.std <- scale(x$soccomp)
x$stairs.std <- scale(x$stairs)

x$newDiff.yd <- scale(x$soccomp) - scale(x$stairs)
x$DifferenceScore <- scale(x$soccomp.std) - scale(x$stairs.std)
hist(x$DifferenceScore)

summary(lm(DifferenceScore ~ age*country.f,data=x))
drop1(lm(DifferenceScore ~ age*country.f,data=x),test='Chisq')
summary(lm(DifferenceScore ~ age+country.f,data=x))
drop1(lm(DifferenceScore ~ age+country.f,data=x),test='Chisq')
summary(lm(DifferenceScore ~ age,data=x))
# what this says is that the difference score itself isn't significant, suggesting pretty good calibration
# and also there is a marginal effect of age suggesting somewhat better calibration with age 
## a bit hard to interpret


r2table <- lm(DifferenceScore ~ age+country.f,data=x)

## Computing & comparing match rates
x <- x %>%
  mutate(ladderBinned = case_when(stairs < 4 ~ 'high',
                                  stairs > 7 ~ 'low',
                                  TRUE ~ 'same'),
         moneyCat = case_when(Qmoney == 1 & ladderBinned == 'high' ~ 1,
                              Qmoney == 2 & ladderBinned == 'same' ~ 1,
                              Qmoney == 3 & ladderBinned == 'low' ~ 1,
                              TRUE ~ 0),
         houseCat = case_when(Qhouse == 1 & ladderBinned == 'high' ~ 1,
                              Qhouse == 2 & ladderBinned == 'same' ~ 1,
                              Qhouse == 3 & ladderBinned == 'low' ~ 1,
                              TRUE ~ 0),
         thingsCat = case_when(Qthings == 1 & ladderBinned == 'high' ~ 1,
                               Qthings == 2 & ladderBinned == 'same' ~ 1,
                               Qthings == 3 & ladderBinned == 'low' ~ 1,
                              TRUE ~ 0),
         foodCat = case_when(Qfood == 1 & ladderBinned == 'high' ~ 1,
                             Qfood == 2 & ladderBinned == 'same' ~ 1,
                             Qfood == 3 & ladderBinned == 'low' ~ 1,
                             TRUE ~ 0),
         matchRate = moneyCat + houseCat + thingsCat + foodCat)

# cross-cutucu still have lower match rate, just like we saw in correlation, only 1 on average
# seem to be lower than everyone else except argentina

legendtitle <- "Country"

ggplot(x,aes(x=country.f,y=matchRate)) +
  stat_summary(fun.y=mean, geom="point", size=4) + 
  stat_summary(fun.data="mean_cl_boot", geom="linerange") +
  ylab("Match Rate \n") +
  xlab("\n Country")  +
  scale_fill_manual(legendtitle, 
                    values = c("pink", "aquamarine3", "deepskyblue2",
                               "mediumpurple2", "orange")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"))+
  theme(text = element_text(size=15, family="Helvetica")) 

summary(lm(matchRate ~ country.f, data=x)) # 3veryone less than US
x$country.f.cc <- relevel(x$country.f, ref="Cross Cutucu")
summary(lm(matchRate ~ country.f.cc, data=x)) # CC marginally or significantly lower than all others


summary(lm(matchRate ~ age, data=x)) # nothing w/ age
summary(lm(matchRate ~ age*country.f, data=x))  # or interacting



## Age trends? ======

mod3 <- lm(stairs ~ soccomp + country.f + age, data=x)
summary(mod3)

## ======




## MacArthur by Social Comparison Interaction
## Faceted by region
legendtitle <- "Population"
ggplot(x,aes(y=stairs,x=soccomp,group=country.f,fill=country.f))+
  facet_wrap(~ country.f, ncol=2) +
  geom_smooth(method='lm', colour="black") +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica")) + 
  ylab("MacArthur Ladder Rung Number \n") +
  xlab("\n Social Comparison Index") +
  scale_fill_manual(legendtitle, 
                    values = c("pink","deepskyblue2", "aquamarine3", 
                               "mediumpurple2", "orange")) 



## MacArthur by Age Interaction
## Faceted by region
legendtitle <- "Population"
ggplot(x,aes(y=stairs,x=age,group=country.f,fill=country.f))+
  facet_wrap(~ country.f, ncol=2) +
  geom_smooth(method='lm', colour="black") +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black")) +
  theme(text = element_text(size=15, family="Helvetica")) + 
  ylab("MacArthur Ladder Rung Number \n") +
  xlab("\n Age") +
  scale_fill_manual(legendtitle, 
                    values = c("pink","deepskyblue2", "aquamarine3", 
                               "mediumpurple2", "orange")) 




## Descriptive -- Data Viz ------------------------------------------------

# density plot of comparison scores by country
legendtitle <- "Population"
df.1 <- data.frame(x$soccomp, 
                   x$country.f)
names(df.1)[names(df.1)=="x.soccomp"] <- "soccomp"
names(df.1)[names(df.1)=="x.country.f"] <- "country"
head(df.1)
p <- ggplot(df.1, aes(x=df.1$soccomp)) + 
  geom_density(aes(group=df.1$country, fill=df.1$country), 
               size=0.1, alpha=0.4, bw=1) +
  scale_fill_manual(legendtitle, 
                    values = c("pink","deepskyblue2", "aquamarine3", 
                               "mediumpurple2", "orange")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"))+
  theme(text = element_text(size=15, family="Helvetica")) + 
  ylab("Density") +
  xlab("Social Comparison Index") 
p


# Violin plot of social comparison scores by country
x$country.f <- factor(x$country, 
                      levels = c( "USA",  "India","Upano Valley", "Argentina", "Cross Cutucu"))

legendtitle <- "Population"
df.1 <- data.frame(x$soccomp, 
                   x$country.f)
names(df.1)[names(df.1)=="x.soccomp"] <- "soccomp"
names(df.1)[names(df.1)=="x.country.f"] <- "country"
head(df.1)
p <- ggplot(df.1, aes(x=country, y=soccomp)) + geom_violin(aes(fill=country), 
                                                           alpha = 0.4, trim = F) +
  stat_summary(fun.y=mean, geom="point", shape=18, size=3) +
  scale_fill_manual(legendtitle, 
                    values = c("pink", "deepskyblue2", "aquamarine3",
                               "mediumpurple2", "orange")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"))+
  theme(text = element_text(size=15, family="Helvetica")) + 
  ylab("Social Comparison Index \n") +
  xlab("\n Population") 
p


# Violin plot of ladder  scores by country
x$country.f <- factor(x$country, 
                      levels = c( "USA",  "India","Upano Valley", "Argentina", "Cross Cutucu"))

legendtitle <- "Population"
df.1 <- data.frame(x$stairs, 
                   x$country.f)
names(df.1)[names(df.1)=="x.stairs"] <- "stairs"
names(df.1)[names(df.1)=="x.country.f"] <- "country"
head(df.1)
p <- ggplot(df.1, aes(x=country, y=stairs)) + geom_violin(aes(fill=country), 
                                                          alpha = 0.4) +
  stat_summary(fun.y=mean, geom="point", shape=18, size=3) +
  scale_fill_manual(legendtitle, 
                    values = c("pink", "aquamarine3", "deepskyblue2",
                               "mediumpurple2", "orange")) +
  theme(panel.grid.major = element_blank(), panel.grid.minor = element_blank(),
        panel.background = element_blank(), axis.line = element_line(colour = "black"))+
  theme(text = element_text(size=15, family="Helvetica")) + 
  ylab("MacArthur Ladder Rung") +
  xlab("Population") 
p


## Density plot of ladder answers by country

df.4 <- data.frame(x$stairs,
                   x$country.f)
names(df.4)[names(df.4)=="x.stairs"] <- "stairs"
names(df.4)[names(df.4)=="x.country.f"] <- "country"
head(df.4)
p <- ggplot(df.4, aes(x=df.4$stairs)) + 
  geom_density(aes(group=df.4$country, fill=df.4$country), size=0.1, alpha=0.4, bw=1)
p



