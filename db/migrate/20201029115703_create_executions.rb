class CreateExecutions < ActiveRecord::Migration[6.0]
  def change
    create_table :executions do |t|
      t.string :identifier
      t.bigint :flow_id
      t.bigint :user_id
      t.text :path, null:false, default: ""
      t.boolean :complete, null: false, default: false
      t.datetime :invalidated_at

      t.timestamps
    end

    add_index :executions, :flow_id
    add_index :executions, :user_id
    add_foreign_key :executions, :flows
    add_foreign_key :executions, :users
  end
end
