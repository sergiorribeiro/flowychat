class ApiController < ActionController::API
  def user_from_header
    return if request.headers[:authorization].nil?

    @current_user ||= User.activated.find_by(
      authorization_token: request.headers[:authorization]
    )
  end

  def current_user
    @current_user
  end
end