class Api::FlowsController < ApiController
  before_action :user_from_header
  before_action :set_flow_by_identifier, only: [:show, :update]

  def show
    permission_service = ::Access::FlowPermissions.new(@flow, current_user).call
    return render json: {}, status: 401 unless permission_service.ok?

    flow_permissions = permission_service.get

    if flow_permissions[:can_edit]
      render json: @flow.as_api_result
    else
      render json: {}, status: 401
    end
  end

  def update
    permission_service = ::Access::FlowPermissions.new(@flow, current_user).call
    return render json: {}, status: 401 unless permission_service.ok?

    flow_permissions = permission_service.get

    if flow_permissions[:can_edit]
      descriptor = request.body.read

      service_result = ::Flowchart::Update.new(
        { 
          identifier: @flow.identifier,
          descriptor: descriptor,
        },
        current_user
      ).call

      if service_result.ok?
        ::FlowExecution::Invalidate.new(@flow.identifier).call

        render json: {}, status: 200
      else
        render json: {}, status: 500
      end
    else
      render json: {}, status: 401
    end
  end

  private

  def set_flow_by_identifier
    @flow = Flow.find_by(identifier: params[:id])
  end
end
