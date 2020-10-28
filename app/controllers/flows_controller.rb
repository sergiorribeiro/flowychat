class FlowsController < ApplicationController
  before_action :user_from_cookie
  before_action :redirect_if_not_in_session
  before_action :set_flow_by_identifier, only: [:edit, :update]

  def list
    @flows = Flow.where(user_id: current_user.id)
  end

  def new; end

  def edit; end

  def create
    service_result = ::Flowchart::Create.new(create_flow_params, current_user).call
    unless service_result.ok?
      render "/flows/new", notice: service_result.get
    else
      redirect_to "/flows"
    end
  end

  def update
    service_result = ::Flowchart::Update.new(create_flow_params, current_user).call
    unless service_result.ok?
      render "/flows/edit", notice: service_result.get
    else
      redirect_to "/flows"
    end
  end

  private

  def set_flow_by_identifier
    @flow = Flow.find_by(identifier: params[:identifier])
  end

  def create_flow_params
    params.permit(:identifier, :title)
  end
end
