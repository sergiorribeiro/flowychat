module Account
  class SignOut < Service
    def initialize(user, cookies)
      @user = user
      @cookies = cookies
    end

    def call
      @user.authorization_token = nil
      @user.save
      cookies.delete :session_token
      ok!
    end
  end
end