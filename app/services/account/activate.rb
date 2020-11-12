module Account
  class Activate < Service
    def initialize(params)
      @identifier = params.fetch(:identifier, nil)
    end

    def call
      return nok!("Invalid token") if target_user.nil?

      target_user.update(activated: true)
      ok!(target_user)
    end

    private

    def target_user
      @target_user ||= User.find_by(activated: false, activation_token: @identifier)
    end
  end
end