class EditorController < ApplicationController
  before_action :user_from_cookie
  before_action :redirect_if_not_in_session
  before_action :set_flow_and_user

  def index
    flow = Flow.find_by(identifier: @flow_id)
    return redirect_to "/404" if flow.nil?

    flow_permissions = ::Access::FlowPermissions.new(flow, @user).call.get

    if flow_permissions[:can_edit]
      render layout: "editor"
    else
      return redirect_to "/401" if flow.nil?
    end
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
