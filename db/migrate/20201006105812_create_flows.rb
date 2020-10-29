class CreateFlows < ActiveRecord::Migration[6.0]
  def change
    create_table :flows do |t|
      t.bigint :user_id
      t.string :identifier
      t.string :title
      t.text :descriptor
      t.boolean :public, null: false, default: false

      t.timestamps
    end
  end
end
