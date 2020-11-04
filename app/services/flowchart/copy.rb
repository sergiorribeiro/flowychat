require "securerandom"
require "fileutils"

module Flowchart
  class Copy < Service
    def initialize(params, user)
      @identifier = params.fetch(:identifier, nil)
      @user = user
    end

    def call
      flow = Flow.find_by(identifier: @identifier)

      copied_flow = Flow.create(
        user_id: @user.id,
        identifier: random_identifier,
        title: "#{flow.title} (copy)",
        brief: flow.brief,
        public: false,
        copyable: false,
        descriptor: flow.descriptor,
        copied_from: flow.id,
      )

      unless flow.picture.empty?
        media_file = MediaFile.find_by(identifier: flow.picture, flow_id: flow.id)
        new_media_file_identifier = saved_file_identifier
        copied_flow.picture = new_media_file_identifier
        copied_flow.save
        MediaFile.create(
          identifier: new_media_file_identifier,
          content_type: media_file.content_type,
          flow_id: copied_flow.id
        )
        FileUtils.cp(file_path(flow.picture), file_path(new_media_file_identifier))
      end
      
      ok!
    end

    private

    def random_identifier
      identifier = SecureRandom.alphanumeric(6)
      random_identifier unless Flow.where(identifier: identifier).count.zero?
      identifier
    end

    def saved_file_identifier
      identifier = SecureRandom.alphanumeric(10)
      saved_file_identifier unless MediaFile.where(identifier: identifier).count.zero?
      identifier
    end

    def file_path(identifier)
      Rails.root.join("storage", "flow_media", identifier)
    end
  end
end
