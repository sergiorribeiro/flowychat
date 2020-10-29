class EditorController < ApplicationController
  before_action :user_from_cookie
  before_action :redirect_if_not_in_session
  before_action :set_flow_and_user

  def index
    render layout: "editor"
  end

  private

  def set_flow_and_user
    @user = current_user
    @flow_id = flow_params.fetch(:identifier, nil)
  end

  def flow_params
    params.permit(:identifier)
  end
end
