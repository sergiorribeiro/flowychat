module Flowchart
  class Update < Service
    def initialize(params, user)
      @identifier = params.fetch(:identifier, nil)
      @title = params.fetch(:title, nil)
      @descriptor = params.fetch(:descriptor, nil)
      @picture = params.fetch(:picture, nil)
      @public = params.fetch(:public, false)
      @copyable = params.fetch(:copyable, false)
      @user = user
    end

    def call
      @flow = Flow.find_by(identifier: @identifier)
      @flow.title = @title unless @title.nil?
      @flow.brief = @brief unless @brief.nil?
      @flow.descriptor = @descriptor unless @descriptor.nil?
      @flow.public = @public
      @flow.copyable = @copyable
      @flow.picture = saved_file_identifier unless @picture.nil?
      @flow.save
      ok!(@flow)
    end

    private

    def saved_file_identifier
      MediaFileStorage::Save.new(@picture, { flow_id: @flow.id }).call.get
    end
  end
end
