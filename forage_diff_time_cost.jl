
cd("C:\\Users\\erussek\\foraging")

using Gadfly
using DataFrames
using Distances
using DataFramesMeta
using CategoricalArrays
import Cairo
import Fontconfig
using Statistics

# here, we'll have a button 1 vigor cost and a button 2 vigor cost

function build_det_MDP(start_reward, decrement, n_travel_states)
    # takes in
    Rtree = [start_reward];

    reward = copy(start_reward)
    # figure our how many tree states we need
    current_reward = Float64(start_reward);
    while current_reward > .1
        next_reward = current_reward*decrement
        prepend!(Rtree,next_reward)
        current_reward = next_reward
    end
    prepend!(Rtree,0) # let it end at 0 rewards
    n_tree_states = length(Rtree);
    n_states = n_tree_states + n_travel_states;

    next_state = zeros(Int64,n_states,2);
    # fill in for tree states
    for i = n_tree_states:-1:1
        next_state[i,1] = i - 1;
        next_state[i,2] = n_tree_states + 1;
    end
    next_state[1,1] = 1;
    Rs = [Rtree; zeros(n_travel_states)]

    # fill in for travel states
    for i = n_tree_states+1:n_states
        next_state[i,1] = i;
        next_state[i,2] = i+1
    end
    next_state[n_states,2] = n_tree_states;

    return Rs, next_state

end

function time_cost(lag, unit_cost)
    return unit_cost/lag
end

time_cost_plot = plot([x -> time_cost(x,2),
    x -> time_cost(x,6),
    x -> time_cost(x,10)],
        .1,1,
        Guide.xlabel("lag"), Guide.ylabel("time cost"),
        Guide.colorkey(title="Unit Cost",labels = ["2", "6", "10"] ))
draw(PDF("plots/time_cost_plot.pdf", 8inch, 8inch), time_cost_plot)


function evaluate_policy(Rs, next_state, vigor_cost, policy, lag)

    n_states = length(Rs);
    ref_state = 15;
    all_states = Array(1:n_states);
    all_states_not_ref = filter!(x-> x!=ref_state , all_states);

    # run value iteration
    V_pi = zeros(n_states);
    rho_pi = 0.;
    iter = 0;
    other_choice = [2 1];
    max_val_change = 1000;
        #while sp1 >  .01
    while max_val_change > .00001
        iter += 1
        last_V_pi = copy(V_pi);
        last_rho_pi = copy(rho_pi);

        for i = ref_state
            this_state_choice = policy[i];
            this_state_other = other_choice[policy[i]]

             rho_pi = (.99*Rs[next_state[i,this_state_choice]] + .01*Rs[next_state[i,this_state_other]] +
                      .99*last_V_pi[next_state[i,this_state_choice]] + .01*last_V_pi[next_state[i,this_state_other]])/lag[i]
                      - vigor_cost[this_state_choice]/(lag[i]^2);
        end

        for i = all_states_not_ref

            this_state_choice = policy[i];
            this_state_other = other_choice[policy[i]]

            V_pi[i] = .99*Rs[next_state[i,this_state_choice]] + .01*Rs[next_state[i,this_state_other]] +
                        .99*last_V_pi[next_state[i,this_state_choice]] + .01*last_V_pi[next_state[i,this_state_other]] -
                        rho_pi*lag[i] - vigor_cost[this_state_choice]/lag[i];
        end

        max_val_change = maximum(abs.(V_pi - last_V_pi))
    end
    # now re-solve for the reference state (weird that you have to do this?)
    for i = ref_state
        this_state_choice = policy[i];
        this_state_other = other_choice[policy[i]]

        V_pi[i] = .99*Rs[next_state[i,this_state_choice]] + .01*Rs[next_state[i,this_state_other]] +
                    .99*V_pi[next_state[i,this_state_choice]] + .01*V_pi[next_state[i,this_state_other]] -
                    rho_pi*lag[i] - vigor_cost[this_state_choice]/lag[i];
    end

    return V_pi, rho_pi
end

function improve_policy(V_pi, rho_pi, Rs, next_state, vigor_cost)
    n_states = length(V_pi);
    policy = zeros(Int64,n_states);
    lag = ones(n_states);
    # improve the choice policy - this is just based on next states
    # get the optimal lag for Q1, and the optimal lag for Q2
    for i = 1:n_states
        # lag1
        if (rho_pi > 0)
            lag1 = sqrt(vigor_cost[1]/rho_pi)
            lag2 = sqrt(vigor_cost[2]/rho_pi)
        else
            lag1 = 500;
            lag2 = 500;
        end
        these_lags = [lag1 lag2];

        Q1 =  .99*Rs[next_state[i,1]] + .01*Rs[next_state[i,2]] +
                .99*V_pi[next_state[i,1]] + .01*V_pi[next_state[i,2]] -
                these_lags[1]*rho_pi - vigor_cost[1]/these_lags[1];
        Q2 =  .99*Rs[next_state[i,2]] + .01*Rs[next_state[i,1]] +
                .99*V_pi[next_state[i,2]] + .01*V_pi[next_state[i,1]] -
                these_lags[2]*rho_pi - vigor_cost[2]/these_lags[2];

        choice = argmax([Q1 Q2])[2];
        policy[i] = choice;
        lag[i] = these_lags[choice];
    end

    return policy, lag
end

Rs, next_state = build_det_MDP(15.,.9,20);
vigor_cost = [2. 8.]

iter = 0;
n_states = length(Rs);
policy = ones(Int64,n_states);
lag = 500 .*ones(n_states);
max_change = 100;
max_pol_change = 100;
V_pi = zeros(n_states)
rho_pi = 0;
V_pi, rho_pi = evaluate_policy(Rs, next_state,vigor_cost, policy, lag)

policy, lag = improve_policy(V_pi, rho_pi, Rs, next_state, vigor_cost)

# policy iteration
function solve_policy(Rs, next_state, vigor_cost)
    iter = 0;
    n_states = length(Rs);
    policy = ones(Int64,n_states);
    lag = 500 .*ones(n_states);
    max_change = 100;
    max_pol_change = 100;
    V_pi = zeros(n_states)
    rho_pi = 0;
    while max_change > .0001
        iter += 1;
        #println(iter)
        old_policy = copy(policy);
        old_lag = copy(lag);
        V_pi, rho_pi = evaluate_policy(Rs, next_state,vigor_cost, policy, lag)
        #print(V_pi)
        policy, lag = improve_policy(V_pi, rho_pi, Rs, next_state, vigor_cost)
        #println("solve_pol: ", policy[1:25])
        max_pol_change = maximum(abs.(policy - old_policy))
        #println(max_pol_change)
        lag_change = maximum(abs.(lag - old_lag))
        max_change = maximum([max_pol_change lag_change])
    end
    #println("pot_pol: ", policy[40:51])
    return policy, lag, V_pi, rho_pi
end

function sim_forage_pi(start_reward, decrement, n_travel_states, vigor_cost)

    Rs, next_state = build_det_MDP(start_reward,decrement,n_travel_states)
    policy, lag, V_pi, rho_pi = solve_policy(Rs, next_state, vigor_cost)

    n_states = length(Rs);
    n_tree_states = n_states - n_travel_states;
    next_R_stay = zeros(n_states);
    for i = 1:n_states
        next_R_stay[i] = Rs[next_state[i,1]];
    end

    # get the lag for stay and the lag for leave
    stay_lag = lag[policy .== 1][1];
    leave_lag = lag[policy .== 2][1];

    #print(stay_lag)


    next_TR_stay = zeros(n_states);
    for i = 1:n_states
        next_TR_stay[i] = Rs[next_state[i,1]]/stay_lag - vigor_cost[1]/(stay_lag^2);
    end

    tree_states = zeros(Int64,n_states);
    tree_states[1:n_tree_states] .= 1;
    travel_states = zeros(Int64,n_states);
    travel_states[n_tree_states + 1: n_states] .= 1;

    ##
    tree_pol = policy[tree_states .== 1]
    # want first highest # state with policy = 2
    first_leave_state = maximum(findall(tree_pol .== 2))
    # get the reward in teh state after this
    reward_thresh = Rs[next_state[first_leave_state,1]];
    predicted_thresh = reward_thresh/stay_lag - vigor_cost[1]/(stay_lag^2);

    # get the exit threshole

    res_df = DataFrame(state=1:n_states,tree_states = tree_states, travel_states = travel_states,
                reward_thresh = ones(n_states)*reward_thresh, pred_thresh = ones(n_states)*predicted_thresh,
                pol = policy, lag = lag, stay_lag = stay_lag.*ones(n_states), leave_lag = leave_lag*ones(n_states),
                R = Rs, n_travel = n_travel_states*ones(n_states),
                start_R = start_reward*ones(n_states), next_R = next_R_stay, next_TR = next_TR_stay,
                decrement = decrement*ones(n_states), V = V_pi, rho = rho_pi*ones(n_states),
                vigor_cost1 = vigor_cost[1]*ones(n_states), vigor_cost2 = vigor_cost[2]*ones(n_states));
    return res_df
end

data1 = sim_forage_pi(15.,.9,20, [2. 8.])

tree_states = data1[:tree_states]
pol = data1[:pol]
tree_pol = pol[tree_states .== 1]
# want first highest # state with policy = 2
first_leave_state = maximum(findall(tree_pol .== 2))
next_state = data1[:next_states]
# get the reward in teh state after this

#plot(data, y = :pol, x = :next_R)

data = DataFrame();

# it got stuck on 5, 10, 20

# run this for different start rewards
for start_reward = [10. 15. 20.]
    for decrement = [.9]
        for n_travel_states = [5 10 20]
            for vigor_cost1 = 1.
                for vigor_cost2 = [1. 5. 20.]
                    println(start_reward, n_travel_states, vigor_cost2)
                    global data = [data; sim_forage_pi(start_reward,decrement,
                            n_travel_states, [vigor_cost1, vigor_cost2])]
                end
            end
        end
    end
end

#data = DataFrame();

#for vigor_cost = [0.2 10. 100.]#
#    global data = [data; sim_forage_pi(15.,.9,20, vigor_cost)]
#end

#data1 = sim_forage_pi(15.,.9,20, .5)
#data2 = sim_forage_pi(15.,.9,20, 20)

# plot lag as a function of start reward, n_travel_states, vigor_cost
# plot policy as a function of start_reward, n_travel states, vigor_cost
#

# want to make a plot
data_part = @linq data |>
           transform(decrement = CategoricalArray(:decrement),
                    start_R = CategoricalArray(:start_R),
                    n_travel = CategoricalArray(:n_travel),
                    vigor_cost2 = CategoricalArray(:vigor_cost2),
                    pol = CategoricalArray(:pol),
                    tree_states = CategoricalArray(:tree_states))

data_tree = @linq data_part |>
                    where(:tree_states .== 1)



Gadfly.push_theme(:default)


pol_plot = plot(data_tree, x=:next_TR, y=:pol,
     Geom.subplot_grid(Geom.line ),
        color = :vigor_cost2, xgroup=:start_R, ygroup = :n_travel,
        Guide.ylabel("N Travel States"),
        Guide.xlabel("Next R by Start R"),
        Guide.colorkey(title = "Vigor Cost"),
        style(line_width = 2pt),
        Guide.title("Policy")
        )



lag_sum = @linq data_part |>
                by([:pol, :n_travel, :start_R, :vigor_cost2],
                mean_L = mean(:lag), max_L = maximum(:lag),
                min_L = minimum(:lag), L = mean(:lag))

rho_sum = @linq data_part |>
                by([:n_travel, :start_R, :vigor_cost2],
                rho = mean(:rho), rew_thresh = mean(:reward_thresh),
                stay_lag = mean(:stay_lag), pred_thresh = mean(:pred_thresh),
                leave_lag = mean(:leave_lag))

plot1 = plot(rho_sum, y = :leave_lag, x = :rew_thresh, color = :vigor_cost2)
plot2 = plot(rho_sum, y = :stay_lag, x = :rew_thresh, color = :vigor_cost2)
plot3 = plot(rho_sum, y = :stay_lag, x = :leave_lag, color = :vigor_cost2)

lag_vs_thresh_point = vstack(plot1, plot2, plot3)


lag_plot = plot(lag_sum, x = :pol, y = :L,
    Geom.subplot_grid(Geom.bar(position= :dodge)),
    color = :vigor_cost2, y_group = :n_travel,
    x_group = :start_R,
    Guide.ylabel("N Travel States"),
    Guide.xlabel("Action by Start R"),
    Guide.colorkey(title = "Vigor Cost"),
    Guide.title("Lag")
    )

rho_plot = plot(rho_sum, x = :start_R, y = :rho,
    Geom.subplot_grid(Geom.bar(position= :dodge)),
    color = :vigor_cost2, y_group = :n_travel,
    Guide.ylabel("Rho by N Travel States"),
    Guide.xlabel("Action by Start R"),
    Guide.colorkey(title = "Vigor Cost")
    )

exit_thresh = plot(rho_sum, x = :start_R, y = :rew_thresh,
    Geom.subplot_grid(Geom.bar(position= :dodge)),
    color = :vigor_cost2, y_group = :n_travel,
    Guide.ylabel("N Travel States"),
    Guide.xlabel("Start R"),
    Guide.colorkey(title = "Vigor Cost"),
    Guide.title("Exit Thresholds")
    )

exit_thresh_lag = vstack(lag_plot, exit_thresh)

draw(PDF("plots/exit_thresh_lag.pdf", 8inch, 12inch), exit_thresh_lag)
draw(PDF("plots/exit_thresh_lag_point.pdf", 8inch, 12inch), lag_vs_thresh_point)
