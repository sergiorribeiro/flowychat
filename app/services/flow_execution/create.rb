require "securerandom"

module FlowExecution
  class Create < Service
    def initialize(flow_id)
      @flow_id = flow_id
    end

    def call
      execution = Execution.create(
        flow_id: @flow_id,
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