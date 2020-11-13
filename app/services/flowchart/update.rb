module Flowchart
  class Update < Service
    def initialize(params, user)
      @identifier = params.fetch(:identifier, nil)
      @title = params.fetch(:title, nil)
      @brief = params.fetch(:brief, nil)
      @descriptor = params.fetch(:descriptor, nil)
      @picture = params.fetch(:picture, nil)
      @public = params.fetch(:public, nil)
      @copyable = params.fetch(:copyable, nil)
      @user = user
    end

    def call
      @flow = Flow.find_by(identifier: @identifier)
      unless @title.nil?
        return nok!("❌ Empty flow title") if @title.empty?
      end
      @flow.title = @title unless @title.nil?
      @flow.brief = @brief unless @brief.nil?
      @flow.descriptor = @descriptor unless @descriptor.nil?
      @flow.public = @public unless @public.nil?
      @flow.copyable = @copyable unless @copyable.nil?
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
