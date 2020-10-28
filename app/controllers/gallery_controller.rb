class GalleryController < ApplicationController
  before_action :user_from_cookie
  before_action :redirect_if_not_in_session

  def list
    @flows = Flow.where(user_id: current_user.id, public: true)
  end
end
