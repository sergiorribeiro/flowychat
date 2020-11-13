module Account
  class Update < Service
    def initialize(params, user)
      @user = user
      @display_name = params.fetch(:display_name, nil)
      @current_password = params.fetch(:current_password, nil)
      @new_password = params.fetch(:new_password, nil)
      @new_password_repeat = params.fetch(:new_password_repeat, nil)
    end

    def call
      unless @display_name.empty?
        logged_user.update(
          display_name: @display_name
        )
      end

      unless @current_password.empty? && @new_password.empty?
        return nok!("❌ Unable to authenticate") unless logged_user.authenticate(@current_password)

        logged_user.update(
          password: @new_password,
          password_confirmation: @new_password_repeat,
        )
      end

      ok!
    end

    private

    def logged_user
      @logged_user ||= User.find(@user.id)
    end
  end
end