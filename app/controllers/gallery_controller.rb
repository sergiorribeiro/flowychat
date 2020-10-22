class GalleryController < ApplicationController
  before_action :user_from_cookie
  before_action :redirect_if_not_in_session

  def list
  end
end
