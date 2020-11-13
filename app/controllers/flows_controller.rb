class FlowsController < ApplicationController
  before_action :location_info
  before_action :user_from_cookie
  before_action :redirect_if_not_in_session
  before_action :set_flow_by_identifier, only: [:edit, :update, :delete, :copy]

  def list
    add_crumb(nil, "flows")
    @flows = Flow.where(user_id: current_user.id)
  end

  def new
    add_crumb("/flows", "flows")
    add_crumb(nil, "new flow")
  end

  def edit
    add_crumb("/flows", "flows")
    add_crumb(nil, "editing flow")
  end

  def create
    service_result = ::Flowchart::Create.new(create_flow_params, current_user).call
    unless service_result.ok?
      redirect_to "/flows/new", notice: service_result.get
    else
      redirect_to "/flows"
    end
  end

  def update
    permission_service = ::Access::FlowPermissions.new(@flow, current_user).call
    return render json: {}, status: 401 unless permission_service.ok?

    flow_permissions = permission_service.get

    if flow_permissions[:can_edit]
      service_result = ::Flowchart::Update.new(create_flow_params, current_user).call
      unless service_result.ok?
        redirect_to "/flows/#{@flow.identifier}/edit", notice: service_result.get
      else
        redirect_to "/flows"
      end
    else
      render json: {}, status: 401
    end
  end

  def copy
    permission_service = ::Access::FlowPermissions.new(@flow, current_user).call
    return render json: {}, status: 401 unless permission_service.ok?

    flow_permissions = permission_service.get

    if flow_permissions[:can_copy]
      service_result = ::Flowchart::Copy.new(create_flow_params, current_user).call
      unless service_result.ok?
        redirect_to "/gallery", notice: service_result.get
      else
        redirect_to "/flows"
      end
    else
      render json: {}, status: 401
    end
  end

  def delete
    permission_service = ::Access::FlowPermissions.new(@flow, current_user).call
    return render json: {}, status: 401 unless permission_service.ok?

    flow_permissions = permission_service.get

    if flow_permissions[:can_delete]
      ::Flowchart::Delete.new(delete_flow_params, current_user).call
      redirect_to "/flows"
    else
      render json: {}, status: 401
    end
  end

  private

  def set_flow_by_identifier
    @flow = Flow.find_by(identifier: params[:identifier])
  end

  def create_flow_params
    params.permit(:identifier, :picture, :title, :brief, :public, :copyable)
  end

  def delete_flow_params
    params.permit(:identifier)
  end
end
