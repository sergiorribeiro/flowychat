class GalleryController < ApplicationController
  before_action :location_info
  before_action :user_from_cookie

  def list
    add_crumb(nil, "gallery")
    @flows = Flow.where(public: true)
  end
end
