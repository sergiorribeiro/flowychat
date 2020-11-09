class Api::ExecutionsController < ApiController
  before_action :user_from_header
  before_action :set_execution_by_identifier, only: [:show, :update]

  def show
    permission_service = ::Access::FlowPermissions.new(@execution.flow, current_user).call
    return render json: {}, status: 401 unless permission_service.ok?

    flow_permissions = permission_service.get

    if flow_permissions[:can_execute]
      render json: @execution.as_api_result
    else
      render json: {}, status: 401
    end
  end

  def update
    permission_service = ::Access::FlowPermissions.new(@execution.flow, current_user).call
    return render json: {}, status: 401 unless permission_service.ok?

    flow_permissions = permission_service.get

    if flow_permissions[:can_execute]
      execution_report = JSON.parse(request.body.read, symbolize_names: true)
      service_result = ::FlowExecution::Update.new(
        {
          identifier: @execution.identifier,
          path: execution_report[:path],
          complete: execution_report[:completed],
          started: !execution_report[:path].empty?,
        }
      ).call

      if service_result.ok?
        render json: {}, status: 200
      else
        render json: {}, status: 500
      end
    else
      render json: {}, status: 401
    end
  end

  private

  def set_execution_by_identifier
    @execution = Execution.active.find_by(identifier: params[:id])
  end
end
