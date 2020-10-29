class CreateExecutions < ActiveRecord::Migration[6.0]
  def change
    create_table :executions do |t|
      t.string :identifier
      t.bigint :flow_id
      t.text :path, null:false, default: ""
      t.boolean :complete, null: false, default: false
      t.datetime :invalidated_at

      t.timestamps
    end
  end
end
