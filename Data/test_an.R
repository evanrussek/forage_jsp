#setwd("/Users/evanrussek/uws_jsp/data")
setwd("C:/Users/erussek/uws_jsp/data")

library(dplyr)
library(tidyr)
library(ggplot2)

# read in data
data <- read.csv("evan_train_data_edit.csv")

# get choice trials, add best outcome, gain/loss, select relevant rows
cdf <- data %>%
  filter(grepl("CHOICE", phase)) %>%
  mutate(choice = chosen_machine, outcome = outcome_reached,
        correct =  1*(correct_response == "TRUE"), CA = C1, CB = C2) %>%
        unite("CN", CA, CB) %>%
  mutate(C_best = case_when(
                  o1_val > o2_val ~ 1,
                  o1_val < o2_val ~ 2
                  ),
         gain = case_when(o1_val > 0 | o2_val > 0 ~ 1,
                          o1_val < 0 | o2_val < 0 ~ 0)) %>%
         select(choice, outcome, correct, rt, C1, C2, CN, C_best, gain)

ntrials <- dim(cdf)[1]

# add trial number and whether it's the first or second rating
cdf <- cdf %>%
        mutate(trial = 1:ntrials) %>%
        mutate(rep_number = case_when(
                                  trial <= ntrials/2 ~ 1,
                                  trial > ntrials/2 ~2
        ))

# group by game and rep number
cdf_summ1 <- cdf %>%
  group_by(CN, rep_number) %>%
  summarise(avg_crt = mean(correct), avg_rt = mean(rt))

# print these tables
cdf_summ1 %>% select(-avg_rt) %>% spread(rep_number, avg_crt)
cdf_summ1 %>% select(-avg_crt) %>% spread(rep_number, avg_rt)


corr_plot <- ggplot(cdf_summ1, aes(x=rep_number, y = avg_crt, group = CN)) +
  geom_point() + geom_line() + facet_wrap(~ CN) + ylim(0,1)
corr_plot

rt_plot <- ggplot(cdf_summ1, aes(x=rep_number, y = avg_rt, group = CN)) +
  geom_point() + geom_line() + facet_wrap(~ CN) + ylim(800,3000)
rt_plot

ggsave("plots/evan_pct_corr.png", corr_plot)
ggsave("plots/evan_rt.png", rt_plot)


# group by game and gain/loss
cdf_summ2 <- cdf %>%
  group_by(CN, gain) %>%
  summarise(avg_crt = mean(correct), avg_rt = mean(rt))

corr_plot2 <- ggplot(cdf_summ2, aes(x=gain, y = avg_crt, group = CN)) +
  geom_point() + geom_line() + facet_wrap(~ CN) + ylim(0,1)
corr_plot2

rt_plot2 <- ggplot(cdf_summ2, aes(x=gain, y = avg_rt, group = CN)) +
  geom_point() + geom_line() + facet_wrap(~ CN)+ ylim(700,2500)
rt_plot2

ggsave("plots/evan_pct_corr_gain.png", corr_plot2)
ggsave("plots/evan_rt_gain.png", rt_plot2)

  