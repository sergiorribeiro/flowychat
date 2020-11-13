require "securerandom"

module Account
  class SignIn < Service
    def initialize(params, cookies)
      @cookies = cookies
      @email = params.fetch(:email, nil)
      @password = params.fetch(:password, nil)
    end

    def call
      user = User.activated.find_by(email: @email.downcase)
      return deny_sign_in unless user
      return deny_sign_in unless user.authenticate(@password)
      
      authorization_token = SecureRandom.alphanumeric(40)

      user.authorization_token = authorization_token
      @cookies[:session_token] = authorization_token
      @cookies.delete :remember_token
      user.save

      ok!(user)
    end

    private

    def deny_sign_in
      nok!("❌ Unable to login")
    end
  end
end