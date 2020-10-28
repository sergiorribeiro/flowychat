module Flowchart
  class Update < Service
    def initialize(params, user)
      @identifier = params.fetch(:identifier, nil)
      @title = params.fetch(:title, nil)
      @user = user
    end

    def call
      flow = Flow.find_by(identifier: @identifier)
      flow.title = @title
      flow.save
      ok!(flow)
    end
  end
end
