class MediaController < ApplicationController
  before_action :user_from_cookie

  def inline_image
    send_file file_path, type: media_file.content_type, disposition: "inline"
  end

  private

  def media_file
    @media_file ||= MediaFile.find_by(identifier: params.fetch(:id, nil))
  end

  def file_path
    Rails.root.join("storage", "flow_media", media_file.identifier)
  end
end