module FlowExecution
  class Update < Service
    def initialize(params, user)
      @identifier = params.fetch(:identifier, nil)
      @user = user
    end

    def call
      
    end
  end
end
