library(tidyr)
library(dplyr)
library(ggplot2)
library(ggpubr)

# make a function to plot the task
plot_subj_basic <- function(subj_data){
  
  
  # all the RTs from this trial... 
  rep_1_lag = ggplot(subj_data %>% filter(rep_number == 1), aes(x = press_num, y = lag, group = round))  +
    #geom_rect(data = t1_data, aes(xmin = press_num - 0.5, xmax = press_num + 0.5, ymin = -Inf, ymax = Inf, fill = round)) +
    geom_point(aes(color = phase)) + facet_grid(n_travel_steps ~ travel_key_cond) + theme(legend.position = "none") + ylim(0,350)
  
  rep_2_lag = ggplot(subj_data %>% filter(rep_number == 2), aes(x = press_num, y = lag, group = round))  +
    #geom_rect(data = t1_data, aes(xmin = press_num - 0.5, xmax = press_num + 0.5, ymin = -Inf, ymax = Inf, fill = round)) +
    geom_point(aes(color = phase)) + facet_grid(n_travel_steps ~ travel_key_cond)  + ylim(0,350) #+ theme(legend.position = "none")
  
  
  # reward plots which show the threshold... 
  rep_1_rew <- ggplot(subj_data %>% filter(rep_number == 1), aes(x = press_num, y = reward_obs, group = round))  +
    #geom_rect(data = t1_data, aes(xmin = press_num - 0.5, xmax = press_num + 0.5, ymin = -Inf, ymax = Inf, fill = round)) +
    geom_point(aes(color = phase)) + facet_grid(n_travel_steps ~ travel_key_cond) + theme(legend.position = "none") + ylim(0,110)
  
  rep_2_rew <- ggplot(subj_data %>% filter(rep_number == 2), aes(x = press_num, y = reward_obs, group = round))  +
    #geom_rect(data = t1_data, aes(xmin = press_num - 0.5, xmax = press_num + 0.5, ymin = -Inf, ymax = Inf, fill = round)) +
    geom_point(aes(color = phase)) + facet_grid(n_travel_steps ~ travel_key_cond) + theme(legend.position = "none") + ylim(0,110)
  
  plot(ggarrange(rep_1_lag, rep_2_lag, common.legend = TRUE))
  plot(ggarrange(rep_1_rew,rep_2_rew, common.legend = TRUE))
  
}
 
clean_subj_data <- function(subj_data){
  subj_data <- subj_data %>% select(round, phase, reward_obs, reward_true, lag, exit, start_reward, n_travel_steps,
                                    travel_key, subjectID, trial_num, s_num) %>% group_by(trial_num) %>%
    mutate(press_num = 1:n(), round = as.factor(round), 
           rep_number = case_when(trial_num < 7 ~ 1, TRUE ~ 2)) %>%
    mutate(phase = replace(phase, phase == "Harvest", "HARVEST"), 
           reward_obs = replace(reward_obs, is.na(reward_obs), 0))
  
  subj_data <- subj_data %>% group_by(trial_num) %>% 
    mutate(travel_key = replace(travel_key, travel_key == "", first(travel_key[travel_key != ""]))) %>%
    mutate(travel_key_cond = case_when(travel_key == "['(Z -> / -> T -> Y)']"   ~ "HARD",
                                       travel_key == "['(D -> K -> D -> K)']"  ~ "EASY"))
  
  return(subj_data)
}
 
