Rails.application.routes.draw do
  root to: "webfront#show", as: :root

  namespace :api, constraints: { format: :json } do
    namespace :v1 do
      resources :flow, only: [:show, :update]
    end
  end

  ##########################################
  get "/flows" => "flows#list"
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
  get "/flows/:id/edit" => "editor#index"
  ##########################################
  get "/flows/:id/execute" => "executor#index"
  ##########################################
end
