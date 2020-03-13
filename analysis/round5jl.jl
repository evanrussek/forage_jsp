cd("/Users/evanrussek/forage_jsp/analysis/")

using CSV
using DataFrames
using DataFramesMeta
using CategoricalArrays
using Gadfly
using MixedModels
using StatsBase
using Statistics
using TableView
import Cairo

##                                     ##
####### READ in the data and clean it ########
## ##                                  ##

data = CSV.read("data/run5_data.csv")

# add s_num to it as a factor, get number of subjects
data.s_num = groupindices(groupby(data,:subjectID))
data.subj = CategoricalArray(data.s_num)
n_subj = length(unique(data.subj))

# define travel keys - we checked before that 1 is easy, 2 is hard
travel_keys = unique(data.travel_key)
travel_key_easy = travel_keys[1]
travel_key_hard = travel_keys[2]

function clean_subj_data(s_data)
        # clean subject 1 data...
        s_data = @select(s_data,:round, :phase, :reward_obs,
                                :reward_true, :lag, :exit, :start_reward, :n_travel_steps,
                                :travel_key, :subjectID, :trial_num, :s_num, :correct_key)

        # compute pressnum column... is there as simpler way to do this?
        trial_press_num_df = by(s_data,:trial_num, df -> DataFrame(press_num = 1:nrow(df)))
        s_data.press_num = trial_press_num_df.press_num

        # change phase name, travel_key
        s_data = @byrow! s_data begin
                if :phase == "Harvest"
                :phase = "HARVEST"
                end
                @newcol travel_key_cond::Array{String,1}
                if :travel_key == travel_key_hard
                        :travel_key_cond = "HARD"
                else
                        :travel_key_cond = "EASY"
                end
        end

        return s_data
end

# aggregate all clean data...
cdata = DataFrame();
for s = 1:n_subj
        global cdata
        s_data = @where(data,:subj .== s)
        cdata = vcat(cdata,clean_subj_data(s_data))
end

##########################################
###### EXIT THRESHOLD ANALYSIS ###########
#########################################

## Compute exit thresholds for each round/trial/subj/group
## function to compute exit for each round in a trial's data...
function get_trial_exits(trial_data)
        last_phase = trial_data.phase[end]
        if (last_phase == "HARVEST")
                last_round = trial_data.round[end]
                trial_data = @where(trial_data, :round .!= last_round)
        end

        trial_data = @where(trial_data, .&(:phase .== "HARVEST", missing .!== :reward_obs))

        if size(trial_data,1) > 0
                exit_tbl = by(trial_data, :round,
                        last_reward = :reward_obs => last,
                        #trial_num = :trial_num => first,
                        phase = :phase => first,
                        start_reward = :start_reward => first,
                        travel_key_cond = :travel_key_cond => first
                        )
        else
                exit_tbl = DataFrame(last_reward = [],
                        #trial_num = [],
                        phase = [],
                        start_reward = [],
                        travel_key_cond = [],
                        round = [])
        end
        return exit_tbl
end

# exit_data for each round for each trial for each subject
round_exit_data = by(cdata, [:s_num, :trial_num], df -> get_trial_exits(df))

# exit data for each trial, for each subject
trial_exit_data = by(round_exit_data, [:s_num,:start_reward,:travel_key_cond],
                        exit_thresh = :last_reward => mean,
                        trial_num = :trial_num => first,
                        )
# exit data for each trial, aggregated over subjects
group_exit_data = by(trial_exit_data, [:start_reward, :travel_key_cond],
                df -> DataFrame(
                        exit_thresh = mean(df[:exit_thresh]),
                        exit_sem = std(df[:exit_thresh])/sqrt(nrow(df)),
                        ))

### plot group mean exit thresholds by trial type
exit_min = group_exit_data.exit_thresh - group_exit_data.exit_sem
exit_max = group_exit_data.exit_thresh + group_exit_data.exit_sem

group_exit_plot = plot(group_exit_data, x =:start_reward, y =:exit_thresh,
        ymin =exit_min, ymax = exit_max,
        color =:travel_key_cond,
        Geom.point, Geom.line, Geom.errorbar,
        Guide.xlabel("Tree First Reward"),
        Guide.ylabel("Last Reward Before Exit"),
        Guide.title("Exit Threshold Group Means (N = 50)"),
        Guide.colorkey(title="Travel Key"),
        Theme(line_width = 2pt))

# save this plot...
draw(PNG("plots/group_exit_thresh_jl.png", 4inch, 4inch), group_exit_plot)


## MIXED MODEL EXIT THRESHOLD DATA
# get all variables into the correct data type
round_exit_data.subj = categorical(round_exit_data.s_num)
round_exit_data.start_reward = convert(Array{Float64,1}, round_exit_data.start_reward)
round_exit_data.last_reward = convert(Array{Float64,1}, round_exit_data.last_reward)
round_exit_data.trial_num = convert(Array{Float64,1}, round_exit_data.trial_num)
round_exit_data.round = convert(Array{Float64,1}, round_exit_data.round)
# center start reward so that we can look at effect on average...
round_exit_data.start_reward = round_exit_data.start_reward .- mean(round_exit_data.start_reward)

exit_m = fit!(LinearMixedModel(@formula(last_reward ~ 1 + start_reward*travel_key_cond + trial_num  +
(1 + start_reward*travel_key_cond + trial_num | subj)), round_exit_data))

exit_m

############################
##### LAG DATA ######
#######################
lag_data = @select(cdata, :s_num, :travel_key_cond, :start_reward,
 :phase, :trial_num, :lag, :correct_key, :round, :reward_true, :press_num)

#showtable(lag_data)

 ## remove first press
lag_data = by(lag_data, [:s_num, :trial_num, :round, :phase],
        df -> df[2:end,[:travel_key_cond, :start_reward, :lag,:press_num]])
# add press number
lag_data = by(lag_data, [:s_num, :trial_num, :round, :phase],
        df -> @transform(df[:,[:travel_key_cond, :start_reward, :lag]], press_num_round = 1:nrow(df)))

# remove outliers
lag_data = by(lag_data, :s_num,
        df -> @where(df[:,[:trial_num, :round, :phase,
        :travel_key_cond, :start_reward, :lag, :press_num_round]], .&(:lag .< median(:lag) + 3*mad(:lag),
        :lag .> median(:lag) - 3*mad(:lag))))

# compute log lag
lag_data = @transform(lag_data, log_lag = log.(:lag))
lag_data.subj = CategoricalArray(lag_data.s_num)

# average lag by round
round_lag = by(lag_data,[:subj, :start_reward, :travel_key_cond, :round, :phase],
        df -> DataFrame(trial_num = first(df.trial_num),
                        lag = median(df.lag),
                        log_lag = mean(df.log_lag)))

# average rounds within a trial
trial_lag = by(round_lag, [:subj, :start_reward, :travel_key_cond, :phase],
        df -> DataFrame(trial_num = first(df.trial_num),
                        lag = median(df.lag),
                        log_lag = mean(df.log_lag)))

# average accross subjects
group_lag = by(trial_lag, [:start_reward, :travel_key_cond, :phase],
        df -> DataFrame(trial_num = first(df.trial_num),
                        lag = median(df.lag),
                        log_lag = mean(df.log_lag),
                        log_lag_sem = std(df.log_lag)/sqrt(size(df,1))))
group_lag = @transform(group_lag, upper_ll = :log_lag + :log_lag_sem, lower_ll = :log_lag - :log_lag_sem)
group_lag.phase = CategoricalArray(group_lag.phase)
levels!(group_lag.phase, ["HARVEST", "TRAVEL"])

group_lag_plot_all = plot(group_lag, x=:start_reward, y=:log_lag,
                ymax =:upper_ll, ymin =:lower_ll,
                color=:travel_key_cond, xgroup=:phase,
                Geom.subplot_grid(Geom.line, Geom.point, Geom.errorbar),
                Guide.ylabel("Log Inter-press Time"),
                Guide.xlabel("Tree First Reward by Trial Part"),
                Guide.title("Press Lag Group Means (N = 50)"),
                Guide.colorkey(title="Travel Key"),
        Theme(line_width = 2pt))


draw(PNG("plots/group_lag_plot_allrounds.png", 4inch, 4inch), group_lag_plot_all)


#### MIXED MODEL LAG #######

# get all variables into the correct data type
lag_data.subj = categorical(lag_data.s_num)
lag_data.start_reward = convert(Array{Float64,1}, lag_data.start_reward)
lag_data.log_lag = convert(Array{Float64,1}, lag_data.log_lag)
lag_data.trial_num = convert(Array{Float64,1}, lag_data.trial_num)
lag_data.round = convert(Array{Float64,1}, lag_data.round)
lag_data.press_num_round = convert(Array{Float64,1}, lag_data.press_num_round)


# center start reward so that we can look at effect on average...
lag_data.start_reward = lag_data.start_reward .- mean(lag_data.start_reward)


lag_data = @transform(lag_data,
        harvest_easy = .&(:phase .== "HARVEST" , :travel_key_cond .== "EASY"),
        harvest_hard = .&(:phase .== "HARVEST" , :travel_key_cond .== "HARD"),
        travel_easy = .&(:phase .== "TRAVEL" , :travel_key_cond .== "EASY"),
        travel_hard = .&(:phase .== "TRAVEL" , :travel_key_cond .== "HARD"),
        harvest = .&(:phase .== "HARVEST" ),
        travel = .&(:phase .== "TRAVEL"),
        travel_pn = 1*.&(:travel_key_cond .== "EASY") .+ -1*.&(:travel_key_cond .== "HARD")
        )


form_m2 = @formula(log_lag ~ 0 + harvest_easy + harvest_hard + travel_easy + travel_hard + trial_num +
 start_reward&(harvest_easy + harvest_hard + travel_easy + travel_hard)  +
 (0 + harvest_easy + harvest_hard + travel_easy + travel_hard + trial_num +
  start_reward&(harvest_easy + harvest_hard + travel_easy + travel_hard)| subj))
lag_m2 = fit!(LinearMixedModel(form_m2, lag_data))


form_m3 = @formula(log_lag ~ 0 + harvest + travel + trial_num +
 start_reward&(harvest + travel)  +
 (0 + harvest + travel + trial_num +
  start_reward&(harvest + travel)| subj))

lag_m3 = fit!(LinearMixedModel(form_m3, lag_data))

form_m4 = @formula(log_lag ~ 0 + harvest + travel + trial_num + travel_pn&(harvest + travel) +
        (0 + harvest + travel + trial_num + travel_pn&(harvest + travel) | subj))

lag_m4 = fit!(LinearMixedModel(form_m4, lag_data))

# predict with it?
# split it up into just harvest and travel - look for effects of easy vs hard on each?

######### NOW MAKE A MODEL WITH JUST 1st round#########################
# average rounds within a trial
lag_data_r1 = @where(lag_data, .&(:round .== 1,:press_num_round .< 20))


# average lag by round
round1_lag = by(lag_data_r1,[:subj, :start_reward, :travel_key_cond, :round, :phase],
        df -> DataFrame(trial_num = first(df.trial_num),
                        lag = median(df.lag),
                        log_lag = mean(df.log_lag)))
trial_lag_r1 = by(round1_lag, [:subj, :start_reward, :travel_key_cond, :phase],
        df -> DataFrame(trial_num = first(df.trial_num),
                        lag = median(df.lag),
                        log_lag = mean(df.log_lag)))

# average accross subjects
group_lag_r1 = by(trial_lag_r1, [:start_reward, :travel_key_cond, :phase],
        df -> DataFrame(trial_num = first(df.trial_num),
                        lag = median(df.lag),
                        log_lag = mean(df.log_lag),
                        log_lag_sem = std(df.log_lag)/sqrt(size(df,1))))

group_lag_r1 = @transform(group_lag_r1, upper_ll = :log_lag + :log_lag_sem, lower_ll = :log_lag - :log_lag_sem)
group_lag_r1.phase = CategoricalArray(group_lag_r1.phase)
levels!(group_lag_r1.phase, ["HARVEST", "TRAVEL"])

group_lag_plot_r1 = plot(group_lag_r1, x=:start_reward, y=:log_lag,
                ymax =:upper_ll, ymin =:lower_ll,
                color=:travel_key_cond, xgroup=:phase,
                Geom.subplot_grid(Geom.line, Geom.point, Geom.errorbar),
                Guide.ylabel("Log Inter-press Time"),
                Guide.xlabel("Tree First Reward by Trial Part"),
                Guide.title("Press Lag Group Means (First round only, N = 50)"),
                Guide.colorkey(title="Travel Key"),
        Theme(line_width = 2pt))

draw(PNG("plots/group_lag_plot_r1.png", 4inch, 4inch), group_lag_plot_r1)

############

lag_m2_r1 = fit!(LinearMixedModel(form_m2, lag_data_r1))
lag_m3_r1 = fit!(LinearMixedModel(form_m3, lag_data_r1))
lag_m4_r1 = fit!(LinearMixedModel(form_m4, lag_data_r1))

## save these models?
