require "securerandom"

module FlowExecution
  class Create < Service
    def initialize(flow_id, user)
      @flow_id = flow_id
      @user = user
    end

    def call
      execution = Execution.create(
        flow_id: @flow_id,
        user_id: @user&.id,
        identifier: random_identifier,
        complete: false,
        path: "",
      )
      ok!(execution)
    end

    private

    def random_identifier
      identifier = SecureRandom.alphanumeric(10)
      random_identifier unless Execution.where(identifier: identifier).count.zero?
      identifier
    end
  end
end