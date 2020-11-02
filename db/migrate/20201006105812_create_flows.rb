class CreateFlows < ActiveRecord::Migration[6.0]
  def change
    create_table :flows do |t|
      t.bigint :user_id
      t.string :identifier
      t.string :title
      t.string :brief
      t.string :picture
      t.text :descriptor
      t.boolean :public, null: false, default: false
      t.boolean :copyable, null: false, default: false

      t.timestamps
    end

    add_index :flows, :user_id
    add_foreign_key :flows, :users
  end
end
