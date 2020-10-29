Rails.application.routes.draw do
  root to: "webfront#show", as: :root

  namespace :api, constraints: { format: :json } do
    resources :flows, only: [:show, :update]
    resources :executions, only: [:show, :update]
  end

  ##########################################
  get "/flows" => "flows#list"
  get "/flows/new" => "flows#new"
  post "/flows/create" => "flows#create"
  get "/flows/:identifier/edit" => "flows#edit"
  post "/flows/:identifier/update" => "flows#update"
  ##########################################
  get "/gallery" => "gallery#list"
  ##########################################
  get "/sign_in" => "account#sign_in_form"
  post "/do_sign_in" => "account#sign_in"
  delete "/do_sign_out" => "account#sign_out"
  ##########################################
  get "/sign_up" => "account#sign_up_form"
  post "/do_sign_up" => "account#sign_up"
  ##########################################
  get "/" => "webfront#show"
  ##########################################
  get "/flows/:identifier/editor" => "editor#index"
  ##########################################
  get "/flows/:identifier/execute" => "executor#index"
  get "/x/:identifier" => "executor#resume"
end
