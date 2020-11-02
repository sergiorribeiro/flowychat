class GalleryController < ApplicationController
  before_action :location_info
  before_action :user_from_cookie
  before_action :redirect_if_not_in_session

  def list
    add_crumb(nil, "gallery")
    @flows = Flow.where(public: true)
  end
end
