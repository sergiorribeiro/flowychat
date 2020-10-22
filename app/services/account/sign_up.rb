require "digest/sha1"

module Account
  class SignUp < Service
    def initialize(params)
      @display_name = params.fetch(:display_name, nil)
      @email = params.fetch(:email, nil)
      @password = params.fetch(:password, nil)
    end

    def call
      return nok!("Empty display name") if @display_name.empty?
      return nok!("Empty email") if @email.empty?
      return nok!("Empty password") if @password.empty?
      return nok!("User already exists") if User.find_by(email: @email.downcase)

      user = User.create(
        display_name: @display_name,
        email: @email.downcase,
        password: @password,
        password_confirmation: @password,
        activation_token: activation_token,
      )

      return nok!("Unable to signup") unless user.errors.count.zero?

      # send email with activation link

      ok!(user)
    end

    private

    def random_sequence
      "#{rand(4000000000000000000)}#{Time.now.to_i}"
    end

    def activation_token
      @activation_token ||= Digest::SHA1.hexdigest(random_sequence)
    end

    def activation_link
      # {activation route}_path(activation_token)
    end
  end
end