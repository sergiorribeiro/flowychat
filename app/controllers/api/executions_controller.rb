class Api::ExecutionsController < ApiController
  before_action :user_from_header
  before_action :set_execution_by_identifier, only: [:show, :update]

  def show
    flow_permissions = ::Access::FlowPermissions.new(@execution.flow, current_user).call.get

    if flow_permissions[:can_execute]
      render json: @execution.as_api_result
    else
      render json: {}, status: 401
    end
  end

  def update
    # flow_permissions = ::Access::FlowPermissions.new(@flow, current_user).call.get

    # if flow_permissions[:can_edit]
    #   descriptor = request.body.read

    #   service_result = ::Flowchart::Update.new(
    #     { 
    #       identifier: @flow.identifier,
    #       descriptor: descriptor,
    #     },
    #     current_user
    #   ).call

    #   if service_result.ok?
    #     render json: {}, status: 200
    #   else
    #     render json: {}, status: 500
    #   end
    # else
    #   render json: {}, status: 401
    # end
  end

  private

  def set_execution_by_identifier
    @execution = Execution.find_by(identifier: params[:id])
  end
end