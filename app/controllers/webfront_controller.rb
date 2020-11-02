class WebfrontController < ApplicationController
  before_action :location_info
  before_action :user_from_cookie

end
