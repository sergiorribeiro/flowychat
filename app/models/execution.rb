class Execution < ApplicationRecord
  belongs_to :flow

  def as_api_result
    {
      flow_descriptor: flow.descriptor,
      identifier: identifier,
      path: path,
      complete: complete?,
    }
  end

  scope :active, -> { where(invalidated_at: nil) }
end
