class ExecutorController < ApplicationController
  before_action :user_from_cookie
  before_action :set_user

  def index
    @flow_id = execution_params.fetch(:identifier, nil)

    permission_service = ::Access::FlowPermissions.new(flow, current_user).call
    return render json: {}, status: 401 unless permission_service.ok?

    flow_permissions = permission_service.get

    @execution_id = if flow_permissions[:can_execute]
      service = ::FlowExecution::Create.new(flow.id, current_user).call
      if service.ok?
        service.get.identifier
      end
    else
      nil
    end

    redirect_to "/x/#{@execution_id}"
  end

  def resume
    @execution_id = execution_params.fetch(:identifier, nil)
    @flow_id = execution.flow.identifier
    @permalink = request.original_url

    render :index, layout: "executor"
  end

  private

  def set_user
    @user = current_user
  end

  def execution_params
    params.permit(:identifier)
  end

  def flow
    @flow ||= Flow.find_by(identifier: @flow_id)
  end

  def execution
    @execution ||= Execution.active.find_by(identifier: @execution_id)
  end
end
