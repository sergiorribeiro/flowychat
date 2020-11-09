module FlowExecution
  class Update < Service
    def initialize(params)
      @identifier = params.fetch(:identifier, nil)
      @path = params.fetch(:path, nil)
      @complete = params.fetch(:complete, nil)
      @started = params.fetch(:started, nil)
    end

    def call
      execution = Execution.active.find_by(identifier: @identifier, complete: false)
      execution.path = @path unless @path.nil?
      execution.complete = @complete unless @complete.nil?
      execution.started = @started unless @started.nil?
      execution.save
      ok!(execution)
    end
  end
end
