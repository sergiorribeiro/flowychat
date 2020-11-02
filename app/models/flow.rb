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
end
