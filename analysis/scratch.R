r1_den <- ggplot(subj_data %>% filter(rep_number == 1), aes(x = lag)) + geom_density(aes(fill = phase), alpha = 0.5) + facet_grid(n_travel_steps ~ travel_key_cond) + xlim(0,500)

r2_den <- ggplot(subj_data %>% filter(rep_number == 2), aes(x = lag)) + geom_density(aes(fill = phase), alpha = 0.5) + facet_grid(n_travel_steps ~ travel_key_cond) + xlim(0,500)
#ggdensity(subj_data %>% filter(trial_num == 1), x = "lag", fill = "phase", add = #"median", color = "phase")

ggarrange(r1_den, r2_den, common.legend = TRUE)

# look at just harvest times...
ggplot(subj_data %>% filter(phase == "HARVEST", rep_number == 1), aes(x = lag)) + geom_density(aes(fill = travel_key_cond), alpha = 0.5) + facet_grid(n_travel_steps ~ .) + xlim(0,500) + ggtitle("harvest period rts by condition")

# look at just harvest times...
ggplot(subj_data %>% filter(phase == "TRAVEL", rep_number == 1), aes(x = lag)) + geom_density(aes(fill = travel_key_cond), alpha = 0.5) + facet_grid(n_travel_steps ~ .) + xlim(0,500) + ggtitle("travel period rts by condition")


# effect of harvests on RTs?
rt_ts_r1 <- ggplot(subj_data %>% filter(rep_number == 1), aes(x=lag)) + geom_histogram(aes(fill = factor(n_travel_steps)), alpha = .8) + facet_grid(phase ~ travel_key_cond) + xlim(0,300) + geom_vline(aes(xintercept = 1))
rt_ts_r2 <- ggplot(subj_data %>% filter(rep_number == 2), aes(x=lag)) + geom_density(aes(fill = factor(n_travel_steps)), alpha = .8) + facet_grid(phase ~ travel_key_cond) + xlim(0,300) + geom_vline(aes(xintercept = 1))

ggarrange(rt_ts_r1, rt_ts_r2, common.legend = TRUE)