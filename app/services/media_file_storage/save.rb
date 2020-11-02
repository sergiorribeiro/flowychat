require "securerandom"

module MediaFileStorage
  class Save < Service
    def initialize(file, params)
      @file = file
      @params = params
    end

    def call
      @identifier = random_identifier
      create_media_file
      save_file
      ok!(@identifier)
    end

    private

    def random_identifier
      identifier = SecureRandom.alphanumeric(10)
      random_identifier unless MediaFile.where(identifier: identifier).count.zero?
      identifier
    end

    def create_media_file
      MediaFile.create(@params.merge(
        {
          identifier: @identifier, content_type: @file.content_type 
        }
      ))
    end

    def save_file
      File.open(Rails.root.join("storage", "flow_media", @identifier), "wb") do |file|
        file.write(@file.read)
      end
    end
  end
end