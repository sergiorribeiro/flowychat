class ApplicationController < ActionController::Base
  def user_from_cookie
    return if cookies[:session_token].nil?

    @current_user ||= User.activated.find_by(authorization_token: cookies[:session_token])
  end

  def redirect_if_not_in_session
    redirect_to "/sign_in" unless user_signed_id?
  end

  def redirect_if_in_session
    redirect_to "/flows" if user_signed_id?
  end

  def current_user
    @current_user
  end

  def user_signed_id?
    !current_user.nil?
  end
end
