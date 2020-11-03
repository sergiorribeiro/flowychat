class AccountController < ApplicationController
  before_action :location_info
  before_action :user_from_cookie
  before_action :redirect_if_in_session, only: [:sign_in_form, :sign_up_form, :sign_in, :sign_up]

  def sign_in_form;  end

  def sign_up_form;  end

  def form
    add_crumb(nil, "myself")
  end

  def update
    service_result = ::Account::Update.new(myself_params, current_user).call
    unless service_result.ok?
      render "/form", notice: service_result.get
    else
      redirect_to "/flows"
    end
  end

  def sign_in
    service_result = ::Account::SignIn.new(sign_in_params, cookies).call
    unless service_result.ok?
      render "/sign_in", notice: service_result.get
    else
      redirect_to "/flows"
    end
  end

  def sign_out
    ::Account::SignOut.new(current_user, cookies).call
    redirect_to "/"
  end

  def sign_up
    service_result = ::Account::SignUp.new(sign_up_params).call
    unless service_result.ok?
      redirect_to "/sign_up", notice: service_result.get
    else
      redirect_to "/sign_in"
    end
  end

  private

  def sign_up_params
    params.permit(:display_name, :email, :password)
  end

  def sign_in_params
    params.permit(:email, :password)
  end

  def myself_params
    params.permit(:display_name, :current_password, :new_password, :new_password_repeat)
  end
end
