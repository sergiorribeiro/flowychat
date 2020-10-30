module Flowchart
  class Delete < Service
    def initialize(params, user)
      @identifier = params.fetch(:identifier, nil)
      @user = user
    end

    def call
      Flow.find_by(identifier: @identifier).delete
      ok!
    end
  end
end