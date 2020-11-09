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

  def display_count
    executions.count
  end

  def under_execution_count
    executions.where(complete: false, started: true).count
  end

  def complete_executions
    executions.where(complete: true).count
  end
end
