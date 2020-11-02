class CreateMediaFiles < ActiveRecord::Migration[6.0]
  def change
    create_table :media_files do |t|
      t.string :identifier
      t.string :content_type
      t.bigint :flow_id

      t.timestamps
    end

    add_index :media_files, :flow_id
    add_foreign_key :media_files, :flows
  end
end
