require "securerandom"

module Account
  class SignUp < Service
    def initialize(params)
      @display_name = params.fetch(:display_name, nil)
      @email = params.fetch(:email, nil)
      @password = params.fetch(:password, nil)
      @base_url = params.fetch(:base_url, nil)
    end

    def call
      return nok!("❌ Empty display name") if @display_name.empty?
      return nok!("❌ Empty email") if @email.empty?
      return nok!("❌ Empty password") if @password.empty?
      return nok!("❌ User already exists") if User.find_by(email: @email.downcase)

      user = User.create(
        display_name: @display_name,
        email: @email.downcase,
        password: @password,
        password_confirmation: @password,
        activation_token: activation_token,
      )

      return nok!("❌ Unable to signup") unless user.errors.count.zero?

      UserMailer.with(user: user, activation_link: activation_link).confirmation.deliver_now

      ok!(user)
    end

    private

    def activation_token
      @activation_token ||= SecureRandom.alphanumeric(40)
    end

    def activation_link
      [@base_url, "account/#{activation_token}/activate"].join("/")
    end
  end
end