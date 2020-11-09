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
  get "/flows/:identifier/delete" => "flows#delete"
  get "/flows/:identifier/copy" => "flows#copy"
  ##########################################
  get "/gallery" => "gallery#list"
  ##########################################
  get "/sign_in" => "account#sign_in_form"
  post "/do_sign_in" => "account#sign_in"
  get "/do_sign_out" => "account#sign_out"
  get "/myself" => "account#form"
  post "/myself/update" => "account#update"
  ##########################################
  get "/sign_up" => "account#sign_up_form"
  post "/do_sign_up" => "account#sign_up"
  ##########################################
  get "/" => "webfront#show"
  ##########################################
  get "/flows/:identifier/editor" => "editor#index"
  ##########################################
  get "/flows/:identifier/execute" => "executor#index"
  get "/f/:identifier" => "executor#index"
  get "/x/:identifier" => "executor#resume"
  ##########################################
  get "/media/:id/inline_image" => "media#inline_image"
end
