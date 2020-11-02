module Flowchart
  class Delete < Service
    def initialize(params, user)
      @identifier = params.fetch(:identifier, nil)
      @user = user
    end

    def call
      @flow = Flow.find_by(identifier: @identifier)
      Execution.where(flow_id: @flow.id).destroy_all
      MediaFile.where(flow_id: @flow.id).each do |file|
        @picture = Rails.root.join("storage", "flow_media", file.identifier)
        File.delete(@picture) if File.exist?(@picture)
        file.delete
      end
      @flow.delete
      ok!
    end
  end
end
