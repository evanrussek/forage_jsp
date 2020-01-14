setwd("C:/Users/erussek/forage_jsp/analysis")
#setwd("/Users/evanrussek/forage_jsp/analysis")
## load in libraries... 
rm(list = ls())
library(tidyr)
library(dplyr)
library(zoo)
library(ggplot2)
library(ggpubr)
library(RcppRoll)
library(knitr)

### read in the data
data <- read.csv('data/run5_data.csv')
data <- data %>% ungroup() %>% bind_cols(s_num = group_indices(., subjectID))
data <- data %>% mutate(subj = factor(s_num))
n_subj <- length(unique(data$s_num))


### clean the data
travel_keys = data %>% ungroup() %>% select(travel_key) %>% unique()
travel_keys # coded as hard then easy

clean_subj_data <- function(subj_data, travel_keys){
  # 
  travel_key_easy = travel_keys$travel_key[1]
  travel_key_hard = travel_keys$travel_key[2]
  
  subj_data <- subj_data %>%select(round, phase, reward_obs, reward_true, lag, exit, start_reward, n_travel_steps,
                                   travel_key, subjectID, trial_num, s_num, correct_key) %>% group_by(trial_num) %>%
    mutate(press_num = row_number(), round_fac = as.factor(round)) %>%
    mutate(phase = replace(phase, phase == "Harvest", "HARVEST"))
  
  subj_data <- subj_data %>% group_by(trial_num) %>% 
    mutate(travel_key = replace(travel_key, travel_key == "", first(travel_key[travel_key != ""]))) %>%
    mutate(travel_key_cond = case_when(travel_key == travel_key_hard   ~ "HARD",
                                       travel_key == travel_key_easy  ~ "EASY")) %>%
    filter(!is.na(travel_key_cond))
}

# clean all the data and bind
datalist <- list()
for (i in 1:n_subj){
  subj_data <- data %>% filter(s_num == i)
  subj_data <- clean_subj_data(subj_data, travel_keys)
  subj_data <- ungroup(subj_data)
  datalist[[i]] <- subj_data
}

