class ExecutorController < ApplicationController
  before_action :set_flow_id
  before_action :user_from_cookie

  def index
    # check permissions here
    render layout: "executor"
  end

  private

  def set_flow_id
    @flow_id = flow_params.fetch(:identifier, nil)
  end

  def flow_params
    params.permit(:id)
  end
end
