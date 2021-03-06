# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_11_02_152014) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "executions", force: :cascade do |t|
    t.string "identifier"
    t.bigint "flow_id"
    t.bigint "user_id"
    t.text "path", default: "", null: false
    t.boolean "complete", default: false, null: false
    t.boolean "started", default: false, null: false
    t.datetime "invalidated_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["flow_id"], name: "index_executions_on_flow_id"
    t.index ["user_id"], name: "index_executions_on_user_id"
  end

  create_table "flows", force: :cascade do |t|
    t.bigint "user_id"
    t.string "identifier"
    t.string "title"
    t.string "brief"
    t.string "picture"
    t.text "descriptor"
    t.boolean "public", default: false, null: false
    t.boolean "copyable", default: false, null: false
    t.bigint "copied_from"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_flows_on_user_id"
  end

  create_table "media_files", force: :cascade do |t|
    t.string "identifier"
    t.string "content_type"
    t.bigint "flow_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["flow_id"], name: "index_media_files_on_flow_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "display_name", null: false
    t.string "password_digest", null: false
    t.string "email", null: false
    t.boolean "activated", default: false, null: false
    t.string "activation_token"
    t.string "authorization_token"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  add_foreign_key "executions", "flows"
  add_foreign_key "executions", "users"
  add_foreign_key "flows", "users"
  add_foreign_key "media_files", "flows"
end
