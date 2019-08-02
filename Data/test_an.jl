using DataFrames
using DataFramesMeta
using CSV
using Query

data = CSV.read("Data/evan_train_data_edit.csv")
# select choice trials...
#

choice_df = @linq data |>
                where(typeof.(:phase) .== String) |>
                where(occursin.("CHOICE", :phase)) |>
                select(:C1, :C2, :rt, :chosen_machine,
                        :points_received, :outcome_reached)



# add points received to the choice
