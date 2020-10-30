module FlowExecution
  class Update < Service
    def initialize(params)
      @identifier = params.fetch(:identifier, nil)
      @path = params.fetch(:path, nil)
    end

    def call
      execution = Execution.find_by(identifier: @identifier)
      execution.path = @path unless @path.nil?
      execution.save
      ok!(execution)
    end
  end
end
