class UserMailer < ApplicationMailer

  def confirmation
    @user = params[:user]
    @activation_link  = params[:activation_link]
    mail(to: @user.email, subject: "Welcome to flowychat")
  end

end
