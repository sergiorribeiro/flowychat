class Flow < ApplicationRecord
  belongs_to :user
  has_many :executions

  def as_api_result
    {
      identifier: identifier,
      title: title,
      descriptor: descriptor,
    }
  end

  def copies
    Flow.where(copied_from: id)
  end
end
