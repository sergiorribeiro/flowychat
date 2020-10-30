module Flowchart
  class Update < Service
    def initialize(params, user)
      @identifier = params.fetch(:identifier, nil)
      @title = params.fetch(:title, nil)
      @descriptor = params.fetch(:descriptor, nil)
      @public = params.fetch(:public, false)
      @user = user
    end

    def call
      flow = Flow.find_by(identifier: @identifier)
      flow.title = @title unless @title.nil?
      flow.descriptor = @descriptor unless @descriptor.nil?
      flow.public = @public
      flow.save
      ok!(flow)
    end
  end
end
