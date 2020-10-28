class EditorController < ApplicationController
  before_action :set_flow_id
  before_action :user_from_cookie
  before_action :redirect_if_not_in_session

  def index
    # check permissions here
    render layout: "editor"
  end

  private

  def set_flow_id
    @flow_id = flow_params.fetch(:identifier, nil)
  end

  def flow_params
    params.permit(:id)
  end
end
