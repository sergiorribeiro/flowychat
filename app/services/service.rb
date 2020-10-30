class Service
  def ok!(result=nil)
    ServiceResult.new(true, result)
  end

  def nok!(message=nil)
    ServiceResult.new(false, message)
  end
end