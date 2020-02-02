cd("/Users/evanrussek/forage_jsp/analysis/")

using CSV
using DataFrames
using DataFramesMeta
using CategoricalArrays
using Gadfly
using MixedModels
using StatsBase

#### READ in the data and clean it #####
data = CSV.read("data/run5_data.csv")

# add s_num to it as a factor, get number of subjects
data.s_num = groupindices(groupby(data,:subjectID))
data.subj = CategoricalArray(data.s_num)
n_subj = length(unique(data.subj))

# get unique travel keys... first is easy, second is hard...
travel_keys = unique(data.travel_key)
# first is easy, second is hard...

# get subject 1 data...
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

###### EXIT THRESHOLD ANALYSIS ###########
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
                        trial_num = :trial_num => first,
                        phase = :phase => first,
                        start_reward = :start_reward => first,
                        travel_key_cond = :travel_key_cond => first
                        )
        else
                exit_tbl = DataFrame(last_reward = [],
                        trial_num = [],
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
# plot this
exit_min = group_exit_data.exit_thresh - group_exit_data.exit_sem
exit_max = group_exit_data.exit_thresh + group_exit_data.exit_sem

group_exit_plot = plot(group_exit_data, x =:start_reward, y =:exit_thresh,
        ymin =exit_min, ymax = exit_max,
        color =:travel_key_cond,
        Geom.point, Geom.line, Geom.errorbar,
        Theme(line_width = 3pt))

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

##### LAG DATA ###### 
lag_data = @select(cdata, :s_num, :travel_key_cond, :start_reward,
 :phase, :trial_num, :lag, :correct_key, :round, :reward_true)
 # remove first press
lag_data = by(lag_data, [:s_num, :trial_num, :round, :phase],
        df -> df[2:end,:])
# add press number
lag_data = by(lag_data, [:s_num, :trial_num, :round, :phase],
        df -> @transform(df, press_num = 1:nrow(df)))
# filter out extreme values
lag_data = by(lag_data, :s_num,
        df -> @where(df, .&(:lag .< median(:lag) + 3*mad(:lag),
        :lag .> median(:lag) - 3*mad(:lag))))
# compute log lag
lag_data = @transform(lag_data, log_lag = log.(:lag))



# filter the row number?
# filter the
