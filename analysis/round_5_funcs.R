setwd("C:/Users/erussek/forage_jsp/analysis")
#setwd("/Users/evanrussek/forage_jsp/analysis")
## load in libraries... 
rm(list = ls())
library(tidyr)
library(dplyr)
library(ggplot2)
library(ggpubr)
library(knitr)


clean_subj_data <- function(subj_data, travel_keys){
  # 
  travel_key_easy = travel_keys$travel_key[1]
  travel_key_hard = travel_keys$travel_key[2]
  
  subj_data <- subj_data %>%select(round, phase, reward_obs, reward_true, lag, exit, start_reward, n_travel_steps,
                                   travel_key, subjectID, trial_num, s_num, correct_key) %>% group_by(trial_num) %>%
    mutate(press_num = row_number()) %>% ungroup() %>%
    mutate(phase = replace(phase, phase == "Harvest", "HARVEST"))
  
  subj_data <- subj_data %>% group_by(trial_num) %>% 
    mutate(travel_key = replace(travel_key, travel_key == "", first(travel_key[travel_key != ""]))) %>%
    mutate(travel_key_cond = case_when(travel_key == travel_key_hard   ~ "HARD",
                                       travel_key == travel_key_easy  ~ "EASY")) %>%
    filter(!is.na(travel_key_cond))
  
  return(subj_data)
}

get_cdata <- function(){
  data <- read.csv('data/run5_data.csv')
  #head(data)
  data <- data %>% ungroup() %>% bind_cols(s_num = group_indices(., subjectID))
  data <- data %>% mutate(subj = factor(s_num))
  
  n_subj <- length(unique(data$s_num))
  
  travel_keys = data %>% ungroup() %>% select(travel_key) %>% unique()
  #travel_keys # coded as easy then hard
  
  # clean all the data and bind
  datalist <- list()
  for (i in 1:n_subj){
    subj_data <- data %>% filter(s_num == i)
    subj_data <- clean_subj_data(subj_data, travel_keys)
    subj_data <- ungroup(subj_data)
    datalist[[i]] <- subj_data
  }
  #cdata <- do.call(rbind,datalist)
  cdata <- bind_rows(datalist)
  
  return(cdata)
}

# compute exit thresholds
get_trial_exits <- function(thdata){
  # get harvest
  last_phase <- last(thdata$phase)
  
  # go through data.. if last phase was harvest, remove that round... 
  if (last_phase == "HARVEST"){
    last_round <- last(thdata$round)
    # get the last reward ops...
    last_reward_ob <- last(thdata$reward_obs[!is.na(thdata$reward_obs)])
    
    #if (last_reward_ob > 8){
    thdata <- thdata %>% filter(round != last_round)
    #}
  }
  
  # now select harvest data
  thdata <- thdata %>% filter(phase == "HARVEST", !is.na(reward_obs)) # find out why reward_true has so many .na
  
  ## get either last true reward observed
  return_tbl <- thdata %>% 
    group_by(round) %>% 
    summarise(s_num = first(s_num), last_reward = last(reward_obs),
              trial_num = first(trial_num),
              start_reward = first(start_reward),
              travel_key_cond = first(travel_key_cond)) %>% ungroup()
  return(return_tbl)
}

# gets exit threshold by round... 
get_exit_data <- function(cdata){
  exit_data <- cdata %>% group_by(s_num, trial_num) %>%
    do(get_trial_exits(.)) %>% 
    ungroup() %>% 
    mutate(subj = as.factor(s_num), round_num = as.integer(as.character(round)))
  
  return(exit_data)
}

## lag data...
make_filt_lag <- function(cdata, press_thresh, round_thresh){
  
  lag_data <- cdata %>% droplevels() %>%
    select(s_num, travel_key_cond, start_reward, phase, trial_num, lag, correct_key, round, trial_num, reward_true) %>% 
    mutate(log_lag = log(lag)) %>% group_by(s_num, trial_num, round, phase) %>% 
    slice(-1) %>% ungroup() %>% 
    mutate(subj = as.factor(s_num))
  
  # for each harvest round, select the first 20
  lag_data <- lag_data %>% group_by(s_num, trial_num, round, phase) %>% 
    mutate(press_num = row_number()) %>% 
    filter(press_num < press_thresh & round < round_thresh ) %>% 
    ungroup()
  
  ### change how we do filtering... 
  filt_lag <- lag_data %>% group_by(s_num) %>% 
    filter(lag < median(lag) + 3*mad(lag),  lag > (median(lag) - 3*mad(lag))) %>% ungroup() %>%
    mutate(ll_scale = scale(log_lag))
  
  return(filt_lag)
  
}

make_round_filt_lag <- function(cdata, press_thresh, round_thresh){
  filt_lag <- make_filt_lag(cdata,press_thresh,round_thresh)
  round_filt_lag <- filt_lag %>% ungroup() %>%
    group_by(s_num, start_reward, travel_key_cond, round, phase) %>%
    summarise(trial_num = first(trial_num), mean_lag = mean(lag),
              mean_log_lag = mean(log_lag), 
              mll_scale = mean(ll_scale)) %>%
    mutate(round_num = as.integer(as.character(round))) %>% 
    ungroup() %>%
    mutate(subj = factor(s_num))
  return(round_filt_lag)
}

make_trial_filt_lag <- function(cdata, press_thresh, round_thresh){
  round_filt_lag <- make_round_filt_lag(cdata,press_thresh,round_thresh)
  
  trial_filt_lag <- round_filt_lag %>% ungroup() %>% droplevels() %>% complete(s_num, start_reward, travel_key_cond, phase) %>%
    group_by(s_num, start_reward, travel_key_cond, phase) %>%
    summarise(trial_num = first(trial_num), 
              mean_lag = mean(mean_lag), 
              mean_log_lag = mean(mean_log_lag),
              mll_scale = mean(mll_scale)) %>% ungroup() %>% mutate(subj = as.factor(s_num))
}