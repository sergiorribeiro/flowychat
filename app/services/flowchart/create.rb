require "securerandom"

module Flowchart
  class Create < Service
    def initialize(params, user)
      @title = params.fetch(:title, nil)
      @brief = params.fetch(:brief, nil)
      @picture = params.fetch(:picture, nil)
      @public = params.fetch(:public, false)
      @copyable = params.fetch(:copyable, false)
      @user = user
    end

    def call
      @flow = Flow.create(
        user_id: @user.id,
        identifier: random_identifier,
        title: @title,
        brief: @brief,
        public: @public,
        copyable: @copyable,
        descriptor: {},
      )

      unless @picture.nil?
        @flow.picture = saved_file_identifier
        @flow.save
      end

      ok!(@flow)
    end

    private

    def random_identifier
      identifier = SecureRandom.alphanumeric(6)
      random_identifier unless Flow.where(identifier: identifier).count.zero?
      identifier
    end

    def saved_file_identifier
      MediaFileStorage::Save.new(@picture, { flow_id: @flow.id }).call.get
    end
  end
end