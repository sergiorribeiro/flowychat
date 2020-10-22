class ServiceResult
  def initialize(state, result)
    @state = state
    @result = result
  end

  def ok?
    @state
  end

  def get
    @result
  end
end