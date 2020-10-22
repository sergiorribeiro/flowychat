class User < ApplicationRecord
  has_secure_password

  validates :display_name, presence: true
  validates :email, presence: true, uniqueness: {case_sensitive: false}

  scope :activated, -> { where(activated: true) }
end
