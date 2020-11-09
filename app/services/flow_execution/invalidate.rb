module FlowExecution
  class Invalidate < Service
    def initialize(identifier)
      @identifier = identifier
    end

    def call
      flow = Flow.find_by(identifier: @identifier)
      return nok!("Invalid flow") if flow.nil?

      flow.executions.active.where(started: true, completed: false).
        update_all(invalidated_at: Time.current)
      ok!
    end
  end
end
