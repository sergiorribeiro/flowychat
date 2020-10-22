class CreateUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :users do |t|
      t.string :display_name, null: false
      t.string :password_digest, null: false
      t.string :email, null: false
      t.boolean :activated, default: false, null: false
      t.string :activation_token
      t.string :authorization_token

      t.timestamps
    end
  end
end
