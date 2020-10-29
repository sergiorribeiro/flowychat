class Flow < ApplicationRecord
  def as_api_result
    {
      identifier: identifier,
      title: title,
      descriptor: descriptor,
    }
  end
end
