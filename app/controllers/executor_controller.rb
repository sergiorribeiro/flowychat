class ExecutorController < ApplicationController
  before_action :user_from_cookie
  before_action :set_user

  def index
    @flow_id = execution_params.fetch(:identifier, nil)

    permission_service = ::Access::FlowPermissions.new(flow, current_user).call
    return redirect_to "/404" if flow.nil?
    return redirect_to "/401" unless permission_service.ok?

    flow_permissions = permission_service.get

    @execution_id = if flow_permissions[:can_execute]
      service = ::FlowExecution::Create.new(flow.id, current_user).call
      if service.ok?
        service.get.identifier
      end
    else
      nil
    end

    query = ""
    if request.path.include? "/embed/"
      query += "&is_embed=1"
      query += "&flow_permalink=1" if (execution_params[:flow_permalink] || "0") == "1"
      query += "&execution_permalink=1" if (execution_params[:execution_permalink] || "0") == "1"
      query += "&embed_permalink=1" if (execution_params[:embed_permalink] || "0") == "1"
      query = query[1..-1] || ""
    end

    redirect_to "/x/#{@execution_id}#{query.empty? ? "" : "?"}#{query}"
  end

  def resume
    @execution_id = execution_params.fetch(:identifier, nil)
    @flow_id = execution.flow.identifier
    @base_url = request.base_url
    @is_embed = (execution_params[:is_embed] || "0") == "1"
    @sharing_options = {
      flow: (execution_params[:flow_permalink] || "0") == "1",
      execution: (execution_params[:execution_permalink] || "0") == "1",
      embed: (execution_params[:embed_code] || "0") == "1"
    }

    render :index, layout: "executor"
  end

  private

  def set_user
    @user = current_user
  end

  def execution_params
    params.permit(:identifier, :flow_permalink, :execution_permalink, :embed_code, :is_embed)
  end

  def flow
    @flow ||= Flow.find_by(identifier: @flow_id)
  end

  def execution
    @execution ||= Execution.active.find_by(identifier: @execution_id)
  end
end
