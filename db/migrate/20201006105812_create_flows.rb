class CreateFlows < ActiveRecord::Migration[6.0]
  def change
    create_table :flows do |t|
      t.bigint :user_id
      t.string :title
      t.jsonb :descriptor

      t.timestamps
    end
  end
end
