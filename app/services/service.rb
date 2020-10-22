class Service
  def ok!(result)
    ServiceResult.new(true, result)
  end

  def nok!(message)
    ServiceResult.new(false, message)
  end
end